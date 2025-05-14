import { ChatOpenAI } from '@langchain/openai';
import { getPromptByUserRole } from './utils/helpers';
import { Client } from 'langsmith';
import { LangChainTracer } from '@langchain/core/tracers/tracer_langchain';
import { StateGraph, END } from '@langchain/langgraph';
import { RunnableLambda } from '@langchain/core/runnables';
import { tavilySearch } from './tools/tavily';
import { callApi } from './tools/api-manager';

// Global store for agent status updates
const agentStatusStore = new Map();

/**
 * Set the status for a specific session
 * @param {string} sessionId - The session ID
 * @param {Object} status - The status object
 */
export function setAgentStatus(sessionId, status) {
  agentStatusStore.set(sessionId, {
    ...status,
    timestamp: Date.now()
  });
  
  // Clean old entries every 1000 updates
  if (agentStatusStore.size % 1000 === 0) {
    cleanOldStatusEntries();
  }
}

/**
 * Get the status for a specific session
 * @param {string} sessionId - The session ID
 * @returns {Object|null} - The status object or null if not found
 */
export function getAgentStatus(sessionId) {
  return agentStatusStore.get(sessionId) || null;
}

/**
 * Clean status entries older than 10 minutes
 */
function cleanOldStatusEntries() {
  const now = Date.now();
  const expiryTime = 10 * 60 * 1000; // 10 minutes
  
  for (const [sessionId, statusData] of agentStatusStore.entries()) {
    if (now - statusData.timestamp > expiryTime) {
      agentStatusStore.delete(sessionId);
    }
  }
}

// Import all agents
import { coordinatorAgent } from './agents/coordinator';
import { generalAgent } from './agents/general';
import { plannerAgent } from './agents/planner';
import { supervisorAgent } from './agents/supervisor';
import { researcherAgent } from './agents/researcher';
import { apiManagerAgent } from './agents/api-manager';
import { reporterAgent } from './agents/reporter';

// Initialize LangSmith client
const client = new Client({
  apiKey: process.env.LANGCHAIN_API_KEY,
  projectName: process.env.LANGCHAIN_PROJECT || "clinic-agent-app",
});

/**
 * The state object for the LangGraph
 * @typedef {Object} AgentState
 * @property {string} message - The user's message
 * @property {Object} user - User information including role
 * @property {string} userRole - 'doctor' or 'patient'
 * @property {Array} plan - Steps planned by the planner
 * @property {Object} context - Data gathered during execution
 * @property {Array} apiResults - Results from API calls
 * @property {Array} researchResults - Results from research
 * @property {string} response - The final response to return to the user
 * @property {string} currentAgent - Current agent processing the request
 * @property {Object} errors - Errors encountered during execution
 */

/**
 * Creates a new state object
 * @param {string} message - The user's message
 * @param {Object} user - User information including role
 * @returns {AgentState} - The initial state
 */
function createInitialState(message, user) {
  // Determine user role based on role ID
  const userRole = user?.role === 2 ? 'doctor' : user?.role === 3 ? 'patient' : 'general';
  
  return {
    message,
    user: { ...(user || {}), role: user?.role || 0 },
    userRole,
    plan: [],
    context: {},
    apiResults: [],
    researchResults: [],
    response: null,
    currentAgent: 'coordinator',
    errors: {}
  };
}

/**
 * Creates the workflow graph for the agent system
 * @returns {StateGraph} - The configured workflow graph
 */
function createWorkflow() {
  // Initialize the graph
  const workflow = new StateGraph({
    channels: {
      message: {},
      user: {},
      userRole: {},
      plan: {},
      context: {},
      apiResults: {},
      researchResults: {},
      response: {},
      currentAgent: {},
      errors: {}
    }
  });
  
  // Add nodes for each agent
  workflow.addNode("coordinator", coordinatorAgent);
  workflow.addNode("general", generalAgent);
  workflow.addNode("planner", plannerAgent);
  workflow.addNode("supervisor", supervisorAgent);
  workflow.addNode("researcher", researcherAgent);
  workflow.addNode("apiManager", apiManagerAgent);
  workflow.addNode("reporter", reporterAgent);
  
  // Define edges based on the state's currentAgent field
  workflow.setEntryPoint("coordinator");
  
  // Add conditional edges with improved flow control
  workflow.addConditionalEdges(
    "coordinator",
    (state) => {
      // Handle null or undefined currentAgent by defaulting to "general"
      if (!state.currentAgent) {
        console.log("Warning: currentAgent is null or undefined in coordinator, defaulting to general");
        return "general";
      }
      return state.currentAgent;
    },
    {
      "general": "general",
      "planner": "planner"
    }
  );
  
  // After planning, go to supervisor to evaluate the plan
  workflow.addConditionalEdges(
    "planner",
    (state) => state.currentAgent,
    {
      "supervisor": "supervisor"
    }
  );
  
  // The supervisor can decide to search, call APIs, or skip directly to reporting
  workflow.addConditionalEdges(
    "supervisor",
    (state) => {
      // Allow the supervisor to skip steps if they're not needed
      // For example, if we only need doctors from database, we can skip research
      return state.currentAgent;
    },
    {
      "researcher": "researcher",
      "apiManager": "apiManager",
      "reporter": "reporter",
      [END]: END
    }
  );
  
  // The researcher only runs if needed for medical information
  workflow.addConditionalEdges(
    "researcher",
    (state) => state.currentAgent,
    {
      "apiManager": "apiManager",
      "reporter": "reporter",
      [END]: END
    }
  );
  
  // The API manager can either go to researcher (if needed) or straight to reporter
  workflow.addConditionalEdges(
    "apiManager",
    (state) => state.currentAgent,
    {
      "researcher": "researcher",
      "reporter": "reporter",
      [END]: END
    }
  );
  
  // Finalize with reporter and end
  workflow.addConditionalEdges(
    "reporter",
    (state) => state.currentAgent || END,
    {
      [END]: END
    }
  );
  
  // General queries always end after response
  workflow.addConditionalEdges(
    "general",
    (state) => state.currentAgent || END,
    {
      [END]: END
    }
  );
  
  return workflow;
}

/**
 * Process a message through the agent system
 * @param {string} message - The user's message
 * @param {Object} user - User information including role
 * @returns {Promise<{response: string, agentStatus: {agent: string, description: string}}>} - The response and agent status
 */
export async function processMessage(message, user) {
  console.log('Processing message:', message);
  console.log('User info:', user);
  
  try {
    // Create the initial state
    const initialState = createInitialState(message, user);
    
    // Create the workflow
    const workflow = createWorkflow();
    
    // Compile the workflow
    const runnable = workflow.compile();
    
    // Create a tracer for LangSmith
    const tracer = new LangChainTracer({
      projectName: process.env.LANGCHAIN_PROJECT || "clinic-agent-app",
      client,
    });
    
    // Track the current agent status
    let currentAgentStatus = {
      agent: "coordinator",
      description: "Determining if your query needs general assistance or specialized healthcare knowledge."
    };
    
    // Update the status in the store
    if (user.sessionId) {
      setAgentStatus(user.sessionId, currentAgentStatus);
    }
    
    // Custom callback for tracking agent transitions
    const agentTracker = {
      handleNodeStart: ({ nodeName }) => {
        // Update the current agent status based on the node being executed
        switch(nodeName) {
          case "coordinator":
            currentAgentStatus = {
              agent: "coordinator",
              description: "Determining if your query needs general assistance or specialized healthcare knowledge."
            };
            break;
          case "general":
            currentAgentStatus = {
              agent: "general",
              description: "Processing your general question (non-healthcare specific)."
            };
            break;
          case "planner":
            currentAgentStatus = {
              agent: "planner",
              description: "Creating a plan to address your healthcare question."
            };
            break;
          case "supervisor":
            currentAgentStatus = {
              agent: "supervisor",
              description: "Reviewing the plan and determining next steps."
            };
            break;
          case "researcher":
            currentAgentStatus = {
              agent: "researcher",
              description: "Searching for relevant medical information to answer your question."
            };
            break;
          case "apiManager":
            currentAgentStatus = {
              agent: "apiManager",
              description: "Retrieving information from healthcare databases."
            };
            break;
          case "reporter":
            currentAgentStatus = {
              agent: "reporter",
              description: "Preparing a comprehensive response based on all gathered information."
            };
            break;
          default:
            // Keep the current status if unknown node
            break;
        }
        
        // Update the status in the store
        if (user.sessionId) {
          setAgentStatus(user.sessionId, currentAgentStatus);
        }
      }
    };
    
    // Execute the workflow with the initial state
    const result = await runnable.invoke(initialState, {
      callbacks: [tracer, agentTracker],
    });
    
    // Extract and return the response with agent status
    return {
      response: result.response || "I'm sorry, I couldn't process your request. Please try again.",
      agentStatus: currentAgentStatus
    };
  } catch (error) {
    console.error('Error in agent system:', error);
    
    const errorStatus = {
      agent: "error",
      description: "An error occurred while processing your request."
    };
    
    // Update status with error if we have a sessionId
    if (user.sessionId) {
      setAgentStatus(user.sessionId, errorStatus);
    }
    
    return {
      response: "I apologize, but I encountered an error while processing your request. Please try again later.",
      agentStatus: errorStatus
    };
  }
} 
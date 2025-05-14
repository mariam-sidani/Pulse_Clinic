import { RunnableLambda } from '@langchain/core/runnables';
import { callApi } from '../tools/api-manager';
import { apiCatalog } from '../docs/api-catalog';
import { ChatOpenAI } from '@langchain/openai';

/**
 * API Manager agent that handles API calls to fetch or manipulate data
 * @type {RunnableLambda}
 */
export const apiManagerAgent = new RunnableLambda({
  name: "ApiManagerAgent",
  func: async (state) => {
    console.log('ApiManagerAgent: Managing API calls');
    
    // Extract API tasks from the plan
    const apiTasks = state.plan.filter(step => step.agent === "API");
    
    if (apiTasks.length === 0) {
      // No API tasks, move to Reporter
      return { currentAgent: "reporter" };
    }
    
    // Initialize LLM for potential parameter resolution
    const llm = new ChatOpenAI({
      temperature: 0,
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    });
    
    // Execute each API task
    const apiResults = [];
    for (const task of apiTasks) {
      try {
        // Extract endpoint and parameters from the task
        if (!task.endpoint) {
          throw new Error(`Missing endpoint for task: ${task.task}`);
        }
        
        // Validate endpoint against API catalog
        let baseEndpoint = task.endpoint.split('?')[0];
        let queryParams = {};
        
        // Parse query parameters if present in the endpoint
        if (task.endpoint.includes('?')) {
          const queryString = task.endpoint.split('?')[1];
          queryString.split('&').forEach(param => {
            const [key, value] = param.split('=');
            if (key && value) {
              queryParams[key] = value;
            }
          });
        }
        
        // Find matching endpoint in catalog
        const matchingEndpoints = Object.keys(apiCatalog).filter(endpoint => {
          // Convert catalog endpoint pattern to regex
          const pattern = endpoint.replace(/\{[^}]+\}/g, '([^/]+)');
          const regex = new RegExp(`^${pattern.replace(/\//g, '\\/')}$`);
          return regex.test(baseEndpoint);
        });
        
        if (matchingEndpoints.length === 0) {
          throw new Error(`Unknown API endpoint: ${task.endpoint}`);
        }
        
        const catalogEndpoint = matchingEndpoints[0];
        const apiDetails = apiCatalog[catalogEndpoint];
        
        // Check for validation issues from planner
        if (task.apiValidationMessage) {
          console.log(`API validation warning: ${task.apiValidationMessage}`);
          
          // Try to resolve missing parameters using LLM if needed
          if (task.missingRequiredParams && task.missingRequiredParams.length > 0) {
            const missingParamsPrompt = `
              I need to make an API call to ${task.endpoint} for this task: "${task.task}"
              
              The API requires these parameters that are missing: ${task.missingRequiredParams.join(', ')}
              
              Based on the user query "${state.message}" and the context so far, 
              what would be reasonable values for these parameters?
              
              Respond in JSON format like: {"paramName1": "value1", "paramName2": "value2"}
            `;
            
            try {
              const paramsResponse = await llm.invoke(missingParamsPrompt);
              const paramsText = paramsResponse.content.trim();
              
              // Extract JSON object from response
              const jsonStartIndex = paramsText.indexOf('{');
              const jsonEndIndex = paramsText.lastIndexOf('}') + 1;
              
              if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
                const paramsJson = paramsText.substring(jsonStartIndex, jsonEndIndex);
                const resolvedParams = JSON.parse(paramsJson);
                
                // Add resolved parameters to task.params
                task.params = { ...(task.params || {}), ...resolvedParams };
                console.log(`Resolved missing parameters: ${JSON.stringify(resolvedParams)}`);
              }
            } catch (paramError) {
              console.error('Error resolving parameters:', paramError);
            }
          }
        }
        
        // Check if this step has dependencies on previous steps that failed
        if (task.params && Object.values(task.params).includes('PENDING')) {
          console.log(`Skipping API call ${task.endpoint} because it depends on PENDING parameters`);
          
          // Skip this call and return placeholder data
          apiResults.push({
            task: task.task,
            endpoint: task.endpoint,
            success: false,
            error: 'Skipped due to missing prerequisite data',
            data: null,
            skipped: true
          });
          
          continue; // Skip to next task
        }
        
        // Merge parameters from both query string and body params
        const params = {
          ...queryParams,
          ...(task.params || {})
        };
        
        // Execute the API call
        let result;
        let success = true;
        let errorMessage = null;
        let usedMockData = false;
        
        try {
          // Attempt the API call
          result = await callApi(task.endpoint, params);
        } catch (apiError) {
          console.error(`API call failed for task "${task.task}":`, apiError);
          success = false;
          errorMessage = apiError.message;
          
          // Get mock data as fallback
          result = getMockDataForEndpoint(task.endpoint, params);
          usedMockData = true;
          
          console.log(`Using mock data for failed API call: ${task.endpoint}`);
        }
        
        // Add the result to apiResults with appropriate metadata
        apiResults.push({
          task: task.task,
          endpoint: task.endpoint,
          success: success,
          error: errorMessage,
          data: result,
          isMockData: usedMockData
        });
      } catch (error) {
        console.error(`Error executing API task "${task.task}":`, error);
        
        // Add a fallback result with error info and mock data
        apiResults.push({
          task: task.task,
          endpoint: task.endpoint || 'unknown',
          success: false,
          error: error.message,
          data: getMockDataForEndpoint(task.endpoint, task.params || {}),
          isMockData: true
        });
      }
    }
    
    // Move to Reporter
    return {
      apiResults,
      currentAgent: "reporter"
    };
  }
});

// Improve error handling in the executeApiTask function
executeApiTask: async (task) => {
  console.log(`API Manager executing task: ${task.task}`);
  
  try {
    // Execute the API call
    const result = await callApi(task.endpoint, task.params || {});
    
    // Add the result to the list with metadata
    return {
      success: true,
      task: task.task,
      endpoint: task.endpoint,
      result,
      error: null
    };
  } catch (error) {
    console.error(`Error executing API task "${task.task}":`, error);
    
    // Return a structured error object instead of throwing
    return {
      success: false,
      task: task.task,
      endpoint: task.endpoint,
      result: null,
      error: error.message,
      // Include mock data when appropriate
      mockData: getMockDataForEndpoint(task.endpoint, task.params)
    };
  }
}

// Add a function to generate mock data for API endpoints
function getMockDataForEndpoint(endpoint, params) {
  if (endpoint.includes('/api/doctors')) {
    if (endpoint.includes('appointments')) {
      return {
        appointments: [
          {
            id: "mock-appt-1",
            doctorId: params?.doctorId || "123",
            date: "2023-12-18",
            time: "09:00",
            available: true
          },
          {
            id: "mock-appt-2",
            doctorId: params?.doctorId || "123",
            date: "2023-12-18",
            time: "10:30",
            available: true
          },
          {
            id: "mock-appt-3",
            doctorId: params?.doctorId || "123",
            date: "2023-12-19",
            time: "14:00",
            available: true
          }
        ],
        _mock: true
      };
    }
    
    return {
      doctors: [
        {
          id: "123",
          name: "Dr. Sarah Chen",
          specialty: "Dentist",
          qualification: "DDS",
          experience: "10 years",
          available: true
        },
        {
          id: "456",
          name: "Dr. Michael Rodriguez",
          specialty: "Dentist",
          qualification: "DMD",
          experience: "15 years",
          available: true
        }
      ],
      _mock: true
    };
  } else if (endpoint.includes('/api/appointments')) {
    return {
      appointmentId: "mock-appt-created",
      success: true,
      message: "Appointment successfully booked (mock)",
      details: {
        doctorId: params?.doctorId || "123",
        patientId: params?.patientId || "456",
        date: params?.appointmentDate || "2023-12-15",
        time: params?.appointmentTime || "14:30",
        reason: params?.reason || "Consultation"
      },
      _mock: true
    };
  }
  
  // Generic mock response
  return {
    success: true,
    message: "Mock API response",
    data: {},
    _mock: true
  };
} 
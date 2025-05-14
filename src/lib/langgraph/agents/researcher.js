import { ChatOpenAI } from '@langchain/openai';
import { RunnableLambda } from '@langchain/core/runnables';
import { tavilySearch } from '../tools/tavily';

/**
 * Researcher agent that performs searches for medical information
 * @type {RunnableLambda}
 */
export const researcherAgent = new RunnableLambda({
  name: "ResearcherAgent",
  func: async (state) => {
    console.log('ResearcherAgent: Researching medical information');
    
    const llm = new ChatOpenAI({
      temperature: 0,
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    });
    
    // Extract research tasks from the plan
    const researchTasks = state.plan.filter(step => step.agent === "RESEARCH");
    
    if (researchTasks.length === 0) {
      // No research tasks, move to API Manager if needed
      return { 
        currentAgent: state.plan.some(step => step.agent === "API") ? "apiManager" : "reporter"
      };
    }
    
    // Generate appropriate search queries based on the tasks
    const prompt = `Given these research tasks:
    ${JSON.stringify(researchTasks)}
    
    And this user query:
    "${state.message}"
    
    Generate 1-3 specific, focused search queries about this medical topic.
    Make the queries detailed and precise to get high-quality medical information.
    
    Format your response as a JSON array of strings:
    ["detailed query 1", "detailed query 2", "detailed query 3"]
    
    Example: For back pain with headaches, good queries might be:
    ["connection between chronic back pain and headaches", 
     "medical causes of combined back pain and headaches",
     "treatment options for patients with both back pain and headaches"]`;
    
    const response = await llm.invoke(prompt);
    
    try {
      // Extract search queries from response
      const queriesText = response.content.trim();
      const jsonStartIndex = queriesText.indexOf('[');
      const jsonEndIndex = queriesText.lastIndexOf(']') + 1;
      
      if (jsonStartIndex === -1 || jsonEndIndex === -1) {
        throw new Error("Could not find valid JSON in the response");
      }
      
      const jsonQueries = queriesText.substring(jsonStartIndex, jsonEndIndex);
      const queries = JSON.parse(jsonQueries);
      
      // Execute searches with specific medical domain options
      const searchOptions = {
        includeDomains: ["cdc.gov", "medlineplus.gov", "nih.gov", "mayoclinic.org", "webmd.com", "healthline.com"],
        searchDepth: "comprehensive",
        maxResults: 5
      };
      
      console.log('Executing medical searches with queries:', queries);
      
      // Execute searches
      const searchResults = [];
      for (const query of queries) {
        try {
          const result = await tavilySearch(query, searchOptions);
          searchResults.push({
            query,
            results: result
          });
          
          // Log successful search
          console.log(`Completed search for "${query}" with ${result.results?.length || 0} results`);
        } catch (error) {
          console.error(`Error searching for "${query}":`, error);
          searchResults.push({
            query,
            error: error.message
          });
        }
      }
      
      // Move to API Manager if there are API tasks, otherwise to Reporter
      return {
        researchResults: searchResults,
        currentAgent: state.plan.some(step => step.agent === "API") ? "apiManager" : "reporter"
      };
    } catch (error) {
      console.error('Error parsing research queries:', error);
      
      // Log error and move to next agent
      return {
        errors: {
          ...state.errors,
          researcher: 'Failed to execute research tasks'
        },
        currentAgent: state.plan.some(step => step.agent === "API") ? "apiManager" : "reporter"
      };
    }
  }
}); 
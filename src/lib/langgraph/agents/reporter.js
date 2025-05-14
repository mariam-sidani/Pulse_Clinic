import { ChatOpenAI } from '@langchain/openai';
import { RunnableLambda } from '@langchain/core/runnables';
import { END } from '@langchain/langgraph';

/**
 * Reporter agent that generates the final response
 * @type {RunnableLambda}
 */
export const reporterAgent = new RunnableLambda({
  name: "ReporterAgent",
  func: async (state) => {
    console.log('ReporterAgent: Generating final response');
    
    const llm = new ChatOpenAI({
      temperature: 0.7,
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    });
    
    // Prepare information for the response
    let apiResults = state.apiResults || [];
    let researchResults = state.researchResults || [];
    let plan = state.plan || [];
    
    // If response is already defined, use it directly
    if (state.response) {
      return {
        response: state.response,
        currentAgent: END
      };
    }
    
    // Use simple response if provided in context
    if (state.context?.simpleResponse) {
      console.log('Using simple response from context');
      return {
        response: state.context.simpleResponse,
        currentAgent: END
      };
    }
    
    // Create a prompt based on available information
    const prompt = `
    You are an assistant for a medical clinic application named Pulse. 
    Generate a friendly, concise response to the user's message.
    
    USER QUERY: ${state.message}
    
    USER ROLE: ${state.userRole === 'patient' ? 'Patient' : state.userRole === 'doctor' ? 'Doctor' : 'General user'}
    
    ${state.context?.noSpecialistsFound ? 
      `IMPORTANT: We searched for a ${state.context.searchedSpecialty || 'specialist'} but couldn't find any in our database.
       Suggest the user to:
       1. Check with other specialties that might help (e.g., general dentistry for tooth problems)
       2. Consider calling the clinic directly for more options
       3. Mention we can help them find other types of doctors if needed` 
      : ''}
    
    IMPORTANT GUIDELINES:
    1. Be brief and direct - use simple language for patients
    2. Focus on answering the main question without extra details
    3. If showing doctor information, only include name, specialty and years of experience
    4. For appointment information, show only dates and times
    5. If no relevant doctors were found, suggest appropriate specialties
    6. NEVER use medical jargon with patients
    7. CRITICAL: Only mention doctors from REAL results, not from mock data
    8. Your response should be truthful and based only on actual database results
    
    ${plan.length > 0 ? `PLAN: ${JSON.stringify(plan, null, 2)}` : ''}
    ${apiResults.length > 0 ? `
API RESULTS: 
${apiResults.map(result => {
  // Mark mock data clearly
  const mockIndicator = result.isMockData ? '[MOCK DATA - DO NOT INCLUDE IN RESPONSE]' : '';
  return `${mockIndicator}
  Task: ${result.task}
  Success: ${result.success}
  ${result.error ? `Error: ${result.error}` : ''}
  Data: ${JSON.stringify(result.data, null, 2)}`;
}).join('\n')}` : 'No API results available.'}

${researchResults.length > 0 ? `
RESEARCH RESULTS: 
${researchResults.map((researchItem, index) => {
  return `
Research Query ${index+1}: "${researchItem.query}"
${researchItem.results && researchItem.results.results ? 
  researchItem.results.results.map((result, i) => 
    `Result ${i+1}: ${result.title}
    ${result.content.substring(0, 200)}${result.content.length > 200 ? '...' : ''}
    Source: ${result.url}`
  ).join('\n\n')
  : 'No results found'
}`;
}).join('\n\n')}` : 'No research results available.'}

RESPONSE FORMAT:
- For patients: 3-4 short sentences maximum
- For doctors: Can include more technical details

YOUR RESPONSE:
    `;
    
    const response = await llm.invoke(prompt);
    
    // Return the final response
    return {
      response: response.content,
      currentAgent: END
    };
  }
}); 
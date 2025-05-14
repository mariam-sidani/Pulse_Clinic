import { ChatOpenAI } from '@langchain/openai';
import { RunnableLambda } from '@langchain/core/runnables';
import { END } from '@langchain/langgraph';

/**
 * General agent that handles non-domain-specific queries
 * @type {RunnableLambda}
 */
export const generalAgent = new RunnableLambda({
  name: "GeneralAgent",
  func: async (state) => {
    console.log('GeneralAgent: Handling general query');
    
    const llm = new ChatOpenAI({
      temperature: 0.7,
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    });
    
    const prompt = `You are a friendly assistant for a medical clinic application named Pulse. 
    Answer general questions in a helpful and friendly way.
    
    User role: ${state.userRole}
    User query: ${state.message}
    
    Provide a concise, helpful response.`;
    
    const response = await llm.invoke(prompt);
    
    return { 
      response: response.content,
      currentAgent: END
    };
  }
}); 
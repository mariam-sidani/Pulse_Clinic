/**
 * Clinic Agent with advanced capabilities
 * This is a placeholder for future implementation
 */

import { ChatOpenAI } from '@langchain/openai';
import { getSystemPromptByRole } from '../utils/helpers';
import { searchWeb } from '../tools/web-search';

/**
 * Creates a clinic agent with tools
 * @param {number} role - The user's role
 * @returns {Object} - The clinic agent
 */
export function createClinicAgent(role) {
  // This is a placeholder for future implementation with tools
  // For now, we'll just return a model with the appropriate system prompt
  
  const systemPrompt = getSystemPromptByRole(role);
  
  return {
    model: new ChatOpenAI({
      modelName: 'gpt-4o-mini',
      temperature: 0.7,
      openAIApiKey: process.env.OPENAI_API_KEY,
    }).bind({
      system: systemPrompt,
    }),
    
    // Placeholder for future tools
    tools: {
      searchWeb: async (query) => {
        return await searchWeb(query);
      }
    }
  };
} 
import { ChatOpenAI } from '@langchain/openai';
import { RunnableLambda } from '@langchain/core/runnables';
import { getCoordinatorPrompt } from '../prompts/coordinator';

/**
 * Coordinator agent that determines if the query is general or requires domain-specific handling
 * @type {RunnableLambda}
 */
export const coordinatorAgent = new RunnableLambda({
  name: "CoordinatorAgent",
  func: async (state) => {
    console.log('CoordinatorAgent: Determining if query is general or domain-specific');
    
    // First, check for keywords that should always route to domain-specific handling
    const lowercaseMessage = state.message.toLowerCase();
    
    // Define keywords that should always be routed to domain-specific
    const domainKeywords = [
      'doctor', 'doctors', 'specialist', 'specialists', 'dentist', 'appointment',
      'schedule', 'book', 'symptom', 'symptoms', 'treatment', 'treatments',
      'specialty', 'specialties', 'medical', 'clinic', 'healthcare', 'patient',
      'diagnosis', 'diagnose', 'prescription', 'medication', 'tooth', 'teeth',
      'pain', 'hurt', 'consult', 'appointment', 'checkup', 'back pain', 'headache',
      'migraine', 'fever', 'cough', 'cold', 'flu', 'allergy', 'allergies', 'rash',
      'ache', 'sore', 'swelling', 'infection', 'fatigue', 'tired', 'dizziness',
      'nausea', 'vomiting', 'diarrhea', 'constipation', 'blood pressure', 'diabetes',
      'asthma', 'cancer', 'heart', 'lung', 'brain', 'muscle', 'joint', 'bone',
      'throat', 'ear', 'eye', 'nose', 'skin', 'stomach', 'intestine', 'kidney',
      'liver', 'head', 'back', 'neck', 'shoulder', 'arm', 'leg', 'knee', 'ankle',
      'wrist', 'elbow', 'hip', 'chronic', 'acute', 'condition'
    ];
    
    // Check if any of the domain keywords are in the message
    const containsDomainKeyword = domainKeywords.some(keyword => lowercaseMessage.includes(keyword));
    
    if (containsDomainKeyword) {
      console.log('CoordinatorAgent: Found domain keyword in message, routing to domain-specific');
      
      return {
        currentAgent: "planner",
        context: {
          ...state.context,
          coordinatorDecision: "DOMAIN"
        }
      };
    }
    
    // If no keywords matched, use the LLM for classification
    const llm = new ChatOpenAI({
      temperature: 0,
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    });
    
    // Get the appropriate prompt for the coordinator
    const prompt = getCoordinatorPrompt(state.userRole, state.message);
    
    const response = await llm.invoke(prompt);
    let decision = response.content.trim().toUpperCase();
    
    // Normalize decision to handle variations
    if (decision === "DOMAIN_SPECIFIC" || decision === "DOMAIN") {
      decision = "DOMAIN";
    } else if (decision !== "GENERAL") {
      console.log(`CoordinatorAgent returned invalid decision: ${decision}, performing secondary check before default`);
      
      // Secondary check for health-related terms to err on the side of caution
      const healthRelatedTerms = ['health', 'medical', 'clinic', 'doctor', 'pain', 'symptom', 'treatment', 'condition'];
      const containsHealthTerm = healthRelatedTerms.some(term => lowercaseMessage.includes(term));
      
      if (containsHealthTerm) {
        console.log('Secondary check detected health-related term, routing to domain-specific');
        decision = "DOMAIN";
      } else {
        console.log('Secondary check passed, defaulting to GENERAL');
        decision = "GENERAL";
      }
    }
    
    console.log(`CoordinatorAgent decision: ${decision}`);
    
    // Update the current agent based on the decision
    return {
      currentAgent: decision === "GENERAL" ? "general" : "planner",
      context: {
        ...state.context,
        coordinatorDecision: decision
      }
    };
  }
}); 
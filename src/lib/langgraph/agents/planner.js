import { ChatOpenAI } from '@langchain/openai';
import { RunnableLambda } from '@langchain/core/runnables';
import { getPromptByUserRole } from '../utils/helpers';
import { recommendApis, apiCatalog } from '../docs/api-catalog';

/**
 * Planner agent that creates a plan for domain-specific queries
 * @type {RunnableLambda}
 */
export const plannerAgent = new RunnableLambda({
  name: "PlannerAgent",
  func: async (state) => {
    console.log('PlannerAgent: Creating plan for domain-specific query');
    
    const llm = new ChatOpenAI({
      temperature: 0,
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    });
    
    // Load the appropriate prompt based on user role
    const promptTemplate = getPromptByUserRole(state.userRole, 'planner');
    
    // Check if the query contains medical symptoms or conditions
    const medicalSymptomKeywords = [
      'pain', 'ache', 'hurt', 'sore', 'discomfort', 
      'headache', 'migraine', 'backache', 'back pain',
      'fever', 'cough', 'cold', 'flu', 'symptom',
      'nausea', 'vomiting', 'dizziness', 'fatigue'
    ];

    const isMedicalSymptomQuery = medicalSymptomKeywords.some(keyword => 
      state.message.toLowerCase().includes(keyword)
    );
    
    // Get API recommendations based on the user query
    const recommendedApis = recommendApis(state.message, state.userRole);
    
    // Format API recommendations for the prompt
    let apiRecommendations = '';
    if (recommendedApis.length > 0) {
      apiRecommendations = `
      Based on the user query, the following APIs might be relevant:
      
      ${recommendedApis.slice(0, 5).map(api => {
        return `
        Endpoint: ${api.endpoint}
        Description: ${api.details.description}
        Use Cases: ${api.details.useCases.join(', ')}
        Example: ${typeof api.details.example === 'object' 
          ? Object.entries(api.details.example).map(([method, ex]) => `${method}: ${ex}`).join(', ') 
          : api.details.example}
        Required Parameters: ${Object.entries(api.details.parameters)
          .filter(([_, paramDetails]) => paramDetails.required)
          .map(([paramName, _]) => paramName)
          .join(', ') || 'None'}
        `;
      }).join('\n')}`;
    }
    
    // Add additional guidance for medical symptom queries
    let medicalGuidance = '';
    if (isMedicalSymptomQuery) {
      medicalGuidance = `
      IMPORTANT: This query mentions medical symptoms or conditions. 
      You MUST include a RESEARCH step to look up reliable medical information about these symptoms.
      Medical symptoms require both research AND finding appropriate specialists.
      `;
    }
    
    const prompt = `${promptTemplate}

    User query: ${state.message}
    
    ${apiRecommendations}
    
    ${medicalGuidance}
    
    Based on this query, create a focused plan to fulfill the user's request. Be concise and prioritize database operations over research when possible.
    
    IMPORTANT PLANNING GUIDELINES:
    1. For patient medical symptoms (pain, headache, etc.), ALWAYS include a RESEARCH step FIRST.
    2. For doctor searches, first check if we have doctors who can help with the specific condition.
    3. Break appointment booking into multiple steps with user confirmation - do NOT create an appointment without user confirmation.
    4. Keep the plan simple and direct - only include necessary steps.
    5. For multi-step flows, use "PENDING" for IDs that will be determined from previous API calls.
    
    Each step should specify which agent should handle it:
    - "RESEARCH" for gathering medical information (researcher agent) - USE SPARINGLY
    - "API" for retrieving or manipulating data (api-manager agent)
    
    For API steps, ALWAYS include:
    1. The task description
    2. The exact endpoint to call 
    3. All required parameters with expected values
    
    Format your response as a JSON array of steps. Example:
    [
      {"agent": "RESEARCH", "task": "Research medical information about back pain and headaches"},
      {"agent": "API", "task": "Get list of all specialties to find relevant specialists", "endpoint": "/api/specialties"},
      {"agent": "API", "task": "Find neurologists who can help with headaches", "endpoint": "/api/doctors?specialty=neurologist"}
    ]
    
    When you need to use a value from a previous response, use "PENDING" instead of making up IDs.
    
    For API calls requiring parameters in a specific format, structure them like this:
    {"agent": "API", "task": "Book an appointment", "endpoint": "/api/appointments", "params": {"method": "POST", "doctorId": "PENDING", "patientId": 456, "appointmentDate": "2023-12-15", "appointmentTime": "14:30", "reason": "Annual checkup"}}`;
    
    const response = await llm.invoke(prompt);
    
    try {
      // Extract JSON plan from the response
      const planText = response.content.trim();
      const jsonStartIndex = planText.indexOf('[');
      const jsonEndIndex = planText.lastIndexOf(']') + 1;
      
      if (jsonStartIndex === -1 || jsonEndIndex === -1) {
        throw new Error("Could not find valid JSON in the response");
      }
      
      const jsonPlan = planText.substring(jsonStartIndex, jsonEndIndex);
      const plan = JSON.parse(jsonPlan);
      
      // Validate API endpoints and parameters
      const validatedPlan = plan.map(step => {
        if (step.agent === "API" && step.endpoint) {
          // Extract the base endpoint without query parameters
          let baseEndpoint = step.endpoint.split('?')[0];
          
          // Handle dynamic path parameters like {doctorId}
          const pathParamRegex = /\/\{([^}]+)\}/g;
          const dynamicPathMatches = [...baseEndpoint.matchAll(pathParamRegex)];
          
          if (dynamicPathMatches.length > 0) {
            // Replace dynamic path parameters with actual values if provided in step.params
            dynamicPathMatches.forEach(match => {
              const paramName = match[1];
              if (step.params && step.params[paramName] !== undefined) {
                baseEndpoint = baseEndpoint.replace(`/{${paramName}}`, `/${step.params[paramName]}`);
              }
            });
          }
          
          // Check if the endpoint exists in our catalog (ignoring dynamic values)
          const matchingEndpoints = Object.keys(apiCatalog).filter(endpoint => {
            // Convert catalog endpoint pattern to regex
            const pattern = endpoint.replace(/\{[^}]+\}/g, '([^/]+)');
            const regex = new RegExp(`^${pattern.replace(/\//g, '\\/')}$`);
            return regex.test(baseEndpoint);
          });
          
          if (matchingEndpoints.length > 0) {
            const catalogEndpoint = matchingEndpoints[0];
            const apiDetails = apiCatalog[catalogEndpoint];
            
            // Check for required parameters
            const requiredParams = Object.entries(apiDetails.parameters)
              .filter(([_, paramDetails]) => paramDetails.required)
              .map(([paramName, _]) => paramName);
            
            // Ensure all required parameters are provided
            const missingParams = requiredParams.filter(param => 
              !step.params || step.params[param] === undefined
            );
            
            if (missingParams.length > 0) {
              // Add missing required parameters info to the step
              step.missingRequiredParams = missingParams;
              step.apiValidationMessage = `Missing required parameters: ${missingParams.join(', ')}`;
            }
          } else {
            // Endpoint not found in catalog
            step.apiValidationMessage = "Endpoint not found in API catalog";
          }
        }
        return step;
      });
      
      console.log('Generated plan:', validatedPlan);
      
      return {
        plan: validatedPlan,
        currentAgent: "supervisor"
      };
    } catch (error) {
      console.error('Error parsing plan:', error);
      return {
        errors: {
          ...state.errors,
          planner: 'Failed to generate a valid plan'
        },
        currentAgent: "supervisor", // Continue to supervisor with error flag
        plan: [] // Empty plan
      };
    }
  }
}); 
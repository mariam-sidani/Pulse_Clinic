import { ChatOpenAI } from '@langchain/openai';
import { RunnableLambda } from '@langchain/core/runnables';

/**
 * Supervisor agent that determines the next steps based on the plan
 * @type {RunnableLambda}
 */
export const supervisorAgent = new RunnableLambda({
  name: "SupervisorAgent",
  func: async (state) => {
    console.log('SupervisorAgent: Supervising plan execution');
    
    // Check if there are errors from the planner
    if (state.errors?.planner) {
      console.log(`Planner error detected: ${state.errors.planner}`);
      
      // If there was an error with the plan, go directly to the reporter
      return {
        response: "I apologize, but I couldn't create a plan to address your question. Could you please provide more details?",
        currentAgent: "reporter"
      };
    }
    
    // If there's no plan or an empty plan, go to reporter
    if (!state.plan || state.plan.length === 0) {
      return {
        response: "I don't have enough information to help with your request. Could you please provide more details?",
        currentAgent: "reporter"
      };
    }
    
    // Process and update PENDING parameters if we have API results
    if (state.apiResults && state.apiResults.length > 0) {
      // Create an updated plan by resolving PENDING parameters
      const updatedPlan = state.plan.map(step => {
        // Only process API steps that have params with PENDING values
        if (step.agent === "API" && step.params) {
          const pendingParams = Object.entries(step.params).filter(([_, value]) => value === "PENDING");
          
          if (pendingParams.length > 0) {
            console.log(`Found ${pendingParams.length} PENDING parameters in step: ${step.task}`);
            
            // Create a copy of the parameters to update
            const updatedParams = { ...step.params };
            
            // Try to resolve each PENDING parameter
            pendingParams.forEach(([paramName, _]) => {
              // Look for the right parameter in previous API results
              // For example, if we need doctorId, look for doctor_id in previous calls
              for (const result of state.apiResults) {
                if (result.success && result.data) {
                  console.log(`Checking result data for ${paramName}:`, JSON.stringify(result.data));
                  
                  // For doctor lookups - check in doctors array
                  if (paramName.toLowerCase().includes('doctor') && result.data.doctors && result.data.doctors.length > 0) {
                    const doctorId = result.data.doctors[0].doctor_id;
                    updatedParams[paramName] = doctorId ? doctorId.toString() : "2"; // Default to 2 if null
                    console.log(`Resolved PENDING ${paramName} to ${updatedParams[paramName]} from doctors array`);
                    break;
                  }
                  // For appointment lookups
                  else if (paramName.toLowerCase().includes('appointment') && result.data.appointments && result.data.appointments.length > 0) {
                    updatedParams[paramName] = result.data.appointments[0].appointment_id.toString();
                    console.log(`Resolved PENDING ${paramName} to ${updatedParams[paramName]} from appointments array`);
                    break;
                  }
                  // Generic case - look for similar keys directly in the data object
                  else {
                    // Try direct key access first (like doctors, appointments, etc.)
                    const directKeys = Object.keys(result.data);
                    for (const key of directKeys) {
                      if (Array.isArray(result.data[key]) && result.data[key].length > 0) {
                        const items = result.data[key];
                        // Look for id fields in the first item
                        const idKeys = Object.keys(items[0]).filter(k => k.includes('_id') || k.includes('Id'));
                        if (idKeys.length > 0) {
                          updatedParams[paramName] = items[0][idKeys[0]].toString();
                          console.log(`Resolved PENDING ${paramName} to ${updatedParams[paramName]} by searching arrays`);
                          break;
                        }
                      }
                    }
                  }
                }
              }
              
              // If still PENDING, use a default value as fallback
              if (updatedParams[paramName] === "PENDING") {
                console.log(`Could not resolve PENDING ${paramName}, using default value`);
                // Default values based on parameter type
                if (paramName.toLowerCase().includes('doctor')) {
                  updatedParams[paramName] = "2"; // Default doctor ID
                } else if (paramName.toLowerCase().includes('patient')) {
                  updatedParams[paramName] = "1"; // Default patient ID
                } else {
                  updatedParams[paramName] = "1"; // Generic default
                }
              }
            });
            
            // Update the step with resolved parameters
            return { ...step, params: updatedParams };
          }
        }
        
        return step;
      });
      
      // Update the state with the updated plan
      state.plan = updatedPlan;
    }
    
    // Analyze the plan steps
    const researchSteps = state.plan.filter(step => step.agent === "RESEARCH");
    const apiSteps = state.plan.filter(step => step.agent === "API");
    
    // Determine if we have database access steps (API calls)
    const hasDatabaseSteps = apiSteps.length > 0;
    
    // Determine if we have research steps
    const hasResearchSteps = researchSteps.length > 0;
    
    // Check if any research has already been done
    const hasCompletedResearch = state.researchResults && state.researchResults.length > 0;
    
    // For medical symptoms, always do research first, before checking doctors
    if (hasResearchSteps && !hasCompletedResearch) {
      console.log('Research steps found in plan and not yet completed - prioritizing research');
      return { 
        currentAgent: "researcher",
        plan: state.plan
      };
    }
    
    // After research is done, continue with API steps
    if (hasDatabaseSteps) {
      // Check for doctor information first
      const doctorApiSteps = apiSteps.filter(step => 
        step.endpoint.includes('/doctors') || 
        step.endpoint.includes('/appointments')
      );
      
      // Check if we already have API results
      if (state.apiResults && state.apiResults.length > 0) {
        // Check for empty doctor results - if we didn't find any doctors, skip to reporter
        const doctorSearchResults = state.apiResults.filter(result => 
          result.endpoint && result.endpoint.includes('/doctors') && 
          !result.endpoint.includes('appointments')
        );
        
        if (doctorSearchResults.length > 0) {
          const doctorResult = doctorSearchResults[0];
          // Check if we got an empty doctors array
          if (doctorResult.success && 
              doctorResult.data && 
              doctorResult.data.doctors && 
              doctorResult.data.doctors.length === 0) {
            
            console.log('No doctors found in search results, skipping all remaining steps');
            
            // If no doctors found, go directly to reporter with a simplified plan
            // that removes all dependent steps
            const updatedPlan = state.plan.filter(step => {
              // Keep only steps that have already been executed
              const alreadyExecuted = state.apiResults.some(result => 
                result.endpoint === step.endpoint
              );
              return alreadyExecuted;
            });
            
            return {
              currentAgent: "reporter",
              plan: updatedPlan,
              context: {
                ...state.context,
                noSpecialistsFound: true,
                searchedSpecialty: extractSpecialtyFromEndpoint(doctorResult.endpoint),
                skipRemainingSteps: true,
                simpleResponse: `I'm sorry, we don't currently have any ${extractSpecialtyFromEndpoint(doctorResult.endpoint) || 'specialists'} available in our clinic. Would you like information about other doctors who might be able to help with your tooth problem?`
              }
            };
          }
        }
        
        // Check remaining API steps that haven't been executed yet
        const completedEndpoints = state.apiResults.map(result => result.endpoint);
        const remainingApiSteps = apiSteps.filter(step => !completedEndpoints.includes(step.endpoint));
        
        if (remainingApiSteps.length > 0) {
          return { 
            currentAgent: "apiManager",
            plan: state.plan
          };
        } else {
          // All API steps completed, go to reporter
          return {
            currentAgent: "reporter",
            plan: state.plan
          };
        }
      }
      
      if (doctorApiSteps.length > 0) {
        // Prioritize API calls first to check if we have doctors for the condition
        return { 
          currentAgent: "apiManager",
          plan: state.plan  // Return the possibly updated plan
        };
      }
    }
    
    // If we need research, go to researcher
    if (hasResearchSteps) {
      return { 
        currentAgent: "researcher",
        plan: state.plan
      };
    }
    
    // If we have API steps but no research needs, go to API manager
    if (hasDatabaseSteps) {
      return { 
        currentAgent: "apiManager",
        plan: state.plan
      };
    }
    
    // If somehow we got here with no steps to execute, go to reporter
    return { 
      currentAgent: "reporter",
      plan: state.plan
    };
  }
});

// Helper function to extract specialty from endpoint
function extractSpecialtyFromEndpoint(endpoint) {
  if (!endpoint) return null;
  
  // Check for specialty parameter
  const specialtyMatch = endpoint.match(/specialty=([^&]+)/);
  if (specialtyMatch && specialtyMatch[1]) {
    return decodeURIComponent(specialtyMatch[1]);
  }
  
  return null;
} 
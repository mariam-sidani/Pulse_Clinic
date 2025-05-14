/**
 * API Manager tool for the agent system
 * Handles making API calls to retrieve or manipulate data
 */

import { apiCatalog } from '../docs/api-catalog';

// Add a base URL for the API calls
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

/**
 * Call an API endpoint with optional parameters
 * @param {string} endpoint - The API endpoint to call
 * @param {Object} params - Optional parameters for the API call
 * @returns {Promise<Object>} - The API response
 */
export async function callApi(endpoint, params = {}) {
  console.log(`API Manager calling endpoint: ${endpoint}`);
  console.log('Parameters:', params);

  try {
    // Process URL parameters for GET requests
    let url = endpoint;
    let options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    // First, handle path parameters if they exist
    if (url.includes('{') && url.includes('}')) {
      const pathParamRegex = /\{([^}]+)\}/g;
      let match;
      
      // Find all path parameters and replace them
      while ((match = pathParamRegex.exec(url)) !== null) {
        const paramName = match[1];
        if (params[paramName]) {
          url = url.replace(`{${paramName}}`, params[paramName]);
          
          // Remove the used path parameter from params to avoid adding it as a query param
          const { [paramName]: _, ...restParams } = params;
          params = restParams;
        }
      }
    }

    // Extract query parameters for GET requests
    if (endpoint.includes('?')) {
      // The endpoint already has query parameters
      url = endpoint;
    } else if (Object.keys(params).length > 0 && (endpoint.startsWith('/api/') || !endpoint.includes('://'))) {
      // Extract method if provided
      if (params.method && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(params.method.toUpperCase())) {
        options.method = params.method.toUpperCase();
        // Don't include method in the query parameters
        const { method, ...queryParams } = params;
        // Only add query parameters for GET requests
        if (options.method === 'GET') {
          const queryParamsObj = new URLSearchParams();
          Object.entries(queryParams).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              queryParamsObj.append(key, value);
            }
          });
          url = `${url}?${queryParamsObj.toString()}`;
        }
      } else {
        // No method specified, assume GET with query parameters
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value);
          }
        });
        url = `${url}?${queryParams.toString()}`;
      }
    }

    // For POST/PUT/DELETE requests with a body
    if (options.method !== 'GET' && Object.keys(params).length > 0) {
      // Remove the method from the body
      const { method, ...bodyParams } = params;
      
      // Only add body for non-GET requests if there are parameters
      if (Object.keys(bodyParams).length > 0) {
        options.body = JSON.stringify(bodyParams);
      }
    }

    // Add base URL for relative paths
    if (url.startsWith('/')) {
      url = `${BASE_URL}${url}`;
    } else if (!url.includes('://')) {
      url = `${BASE_URL}/${url}`;
    }

    console.log(`Making fetch request to: ${url}`);
    console.log('Request options:', options);
    
    // Make the API call
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }
    
    // Parse the JSON response
    const data = await response.json();
    console.log('API response:', data);
    
    return data;
  } catch (error) {
    console.error('Error calling API:', error);
    throw error;
  }
}

/**
 * Generates a helper function for a specific API endpoint
 * @param {string} endpoint - The base API endpoint
 * @param {string} methodName - The name of the generated method
 * @returns {Function} - The generated helper function
 */
function createApiHelper(endpoint, methodName) {
  return async function(params = {}) {
    // Check if the endpoint uses path parameters
    if (endpoint.includes('{')) {
      // Replace path parameters with values from params
      const pathParamRegex = /\{([^}]+)\}/g;
      let modifiedEndpoint = endpoint;
      let match;
      
      // Find all path parameters and replace them
      while ((match = pathParamRegex.exec(endpoint)) !== null) {
        const paramName = match[1];
        if (params[paramName] === undefined) {
          throw new Error(`Required path parameter '${paramName}' is missing for endpoint '${endpoint}'`);
        }
        
        modifiedEndpoint = modifiedEndpoint.replace(`{${paramName}}`, params[paramName]);
        
        // Remove the used path parameter from params
        const { [paramName]: _, ...restParams } = params;
        params = restParams;
      }
      
      return callApi(modifiedEndpoint, params);
    }
    
    // For endpoints without path parameters
    return callApi(endpoint, params);
  };
}

// Export API helper functions for common operations
export const apiHelpers = {};

// Automatically generate helper functions from the API catalog
Object.entries(apiCatalog).forEach(([endpoint, details]) => {
  // Generate a camelCase name for the function based on the endpoint
  const parts = endpoint.split('/').filter(part => part && !part.includes('{'));
  const methodName = parts
    .map((part, index) => index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
  
  apiHelpers[methodName] = createApiHelper(endpoint);
});

// Export individual helper functions for common operations
export const getDoctors = apiHelpers.apiDoctors;
export const getDoctorAppointments = apiHelpers.apiDoctorsAppointments;
export const getPatientAppointments = apiHelpers.apiPatientsAppointments;
export const bookAppointment = async (appointmentData) => {
  return callApi('/api/appointments', {
    method: 'POST',
    ...appointmentData
  });
};
export const getSpecialties = apiHelpers.apiSpecialties; 
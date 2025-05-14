/**
 * API Catalog - Documentation for all available API endpoints
 * This file serves as a comprehensive reference for all API endpoints available in the system.
 * Each API is documented with its purpose, required parameters, optional parameters,
 * and example usage to help agents decide which API to use for specific scenarios.
 */

export const apiCatalog = {
  // Doctor-related endpoints
  "/api/doctors": {
    description: "Get a list of available doctors",
    method: "GET",
    parameters: {
      specialty: {
        type: "string",
        required: false,
        description: "Filter doctors by medical specialty (e.g., 'dentist', 'cardiologist')"
      },
      location: {
        type: "string",
        required: false,
        description: "Filter doctors by location"
      },
      available: {
        type: "boolean",
        required: false,
        description: "Filter by doctors with available appointments"
      }
    },
    useCases: [
      "Finding doctors of a specific specialty",
      "Searching for doctors in a specific location",
      "Finding doctors with available appointments"
    ],
    example: "/api/doctors?specialty=dentist&location=downtown"
  },

  "/api/doctors/{doctorId}": {
    description: "Get detailed information about a specific doctor",
    method: "GET",
    parameters: {
      doctorId: {
        type: "number",
        required: true,
        description: "The unique ID of the doctor"
      }
    },
    useCases: [
      "Getting a doctor's details including credentials and specialties",
      "Checking a doctor's biography and education"
    ],
    example: "/api/doctors/123"
  },

  "/api/doctors/{doctorId}/appointments": {
    description: "Get appointments for a specific doctor",
    method: "GET",
    parameters: {
      doctorId: {
        type: "number",
        required: true,
        description: "The unique ID of the doctor"
      },
      date: {
        type: "string",
        required: false,
        description: "Filter appointments by date (YYYY-MM-DD format)"
      },
      status: {
        type: "string",
        required: false,
        description: "Filter appointments by status ('scheduled', 'cancelled', 'completed')"
      }
    },
    useCases: [
      "Viewing a doctor's schedule",
      "Finding available appointment slots for a doctor",
      "Checking appointments on a specific date"
    ],
    example: "/api/doctors/123/appointments?date=2023-12-15"
  },

  // Patient-related endpoints
  "/api/patients/{patientId}": {
    description: "Get patient information",
    method: "GET",
    parameters: {
      patientId: {
        type: "number",
        required: true,
        description: "The unique ID of the patient"
      }
    },
    useCases: [
      "Retrieving patient details",
      "Checking patient information before booking"
    ],
    example: "/api/patients/456"
  },

  "/api/patients/{patientId}/appointments": {
    description: "Get appointments for a specific patient",
    method: "GET",
    parameters: {
      patientId: {
        type: "number",
        required: true,
        description: "The unique ID of the patient"
      },
      status: {
        type: "string",
        required: false,
        description: "Filter appointments by status ('scheduled', 'cancelled', 'completed')"
      },
      upcoming: {
        type: "boolean",
        required: false,
        description: "Get only upcoming appointments if true"
      }
    },
    useCases: [
      "Viewing a patient's appointment history",
      "Checking upcoming appointments for a patient",
      "Reviewing cancelled or completed appointments"
    ],
    example: "/api/patients/456/appointments?upcoming=true"
  },

  "/api/patients/{patientId}/medical-records": {
    description: "Get medical records for a specific patient",
    method: "GET",
    parameters: {
      patientId: {
        type: "number",
        required: true,
        description: "The unique ID of the patient"
      },
      recordType: {
        type: "string",
        required: false,
        description: "Filter by record type ('lab', 'prescription', 'diagnosis', 'note')"
      }
    },
    useCases: [
      "Reviewing patient medical history",
      "Checking recent lab results",
      "Reviewing prescribed medications"
    ],
    example: "/api/patients/456/medical-records?recordType=prescription"
  },

  // Appointment management endpoints
  "/api/appointments": {
    description: "Create a new appointment or get all appointments",
    method: "GET/POST",
    parameters: {
      // GET parameters
      date: {
        type: "string",
        required: false,
        description: "Filter appointments by date (YYYY-MM-DD format)",
        methodsApplicable: ["GET"]
      },
      status: {
        type: "string",
        required: false,
        description: "Filter appointments by status ('scheduled', 'cancelled', 'completed')",
        methodsApplicable: ["GET"]
      },
      // POST parameters
      method: {
        type: "string",
        required: true,
        value: "POST",
        description: "HTTP method to create an appointment",
        methodsApplicable: ["POST"]
      },
      doctorId: {
        type: "number",
        required: true,
        description: "The ID of the doctor",
        methodsApplicable: ["POST"]
      },
      patientId: {
        type: "number",
        required: true,
        description: "The ID of the patient",
        methodsApplicable: ["POST"]
      },
      appointmentDate: {
        type: "string",
        required: true,
        description: "Date of the appointment (YYYY-MM-DD format)",
        methodsApplicable: ["POST"]
      },
      appointmentTime: {
        type: "string",
        required: true,
        description: "Time of the appointment (HH:MM format)",
        methodsApplicable: ["POST"]
      },
      reason: {
        type: "string",
        required: true,
        description: "Reason for the appointment",
        methodsApplicable: ["POST"]
      }
    },
    useCases: [
      "Booking a new appointment",
      "Viewing all appointments in the system",
      "Filtering appointments by date or status"
    ],
    example: {
      GET: "/api/appointments?date=2023-12-15",
      POST: "/api/appointments with body: {method: 'POST', doctorId: 123, patientId: 456, appointmentDate: '2023-12-15', appointmentTime: '14:30', reason: 'Annual checkup'}"
    }
  },

  "/api/appointments/{appointmentId}": {
    description: "Get, update, or cancel a specific appointment",
    method: "GET/PUT/DELETE",
    parameters: {
      appointmentId: {
        type: "number",
        required: true,
        description: "The unique ID of the appointment"
      },
      // PUT parameters
      method: {
        type: "string",
        required: true,
        description: "HTTP method for the request ('PUT' to update, 'DELETE' to cancel)",
        methodsApplicable: ["PUT", "DELETE"]
      },
      status: {
        type: "string",
        required: false,
        description: "New status for the appointment ('scheduled', 'cancelled', 'completed')",
        methodsApplicable: ["PUT"]
      },
      appointmentDate: {
        type: "string",
        required: false,
        description: "New date for the appointment (YYYY-MM-DD format)",
        methodsApplicable: ["PUT"]
      },
      appointmentTime: {
        type: "string",
        required: false,
        description: "New time for the appointment (HH:MM format)",
        methodsApplicable: ["PUT"]
      }
    },
    useCases: [
      "Viewing details of a specific appointment",
      "Updating appointment details (time, date, etc.)",
      "Cancelling an existing appointment"
    ],
    example: {
      GET: "/api/appointments/789",
      PUT: "/api/appointments/789 with body: {method: 'PUT', appointmentDate: '2023-12-20', appointmentTime: '15:00'}",
      DELETE: "/api/appointments/789 with body: {method: 'DELETE'}"
    }
  },

  // Specialty endpoints
  "/api/specialties": {
    description: "Get a list of all medical specialties",
    method: "GET",
    parameters: {},
    useCases: [
      "Getting all available medical specialties",
      "Filtering specialties for appointment booking",
      "Finding specialties for doctor search"
    ],
    example: "/api/specialties"
  },

  // Available slots endpoints
  "/api/available-slots": {
    description: "Get available appointment slots",
    method: "GET",
    parameters: {
      doctorId: {
        type: "number",
        required: false,
        description: "Filter slots by doctor ID"
      },
      date: {
        type: "string",
        required: false,
        description: "Filter slots by date (YYYY-MM-DD format)"
      },
      specialty: {
        type: "string",
        required: false,
        description: "Filter slots by medical specialty"
      }
    },
    useCases: [
      "Finding available appointment times for a specific doctor",
      "Searching for available slots on a specific date",
      "Finding available slots for a specific medical specialty"
    ],
    example: "/api/available-slots?doctorId=123&date=2023-12-15"
  },

  // Medication endpoints
  "/api/medications": {
    description: "Search for medications and their information",
    method: "GET",
    parameters: {
      query: {
        type: "string",
        required: false,
        description: "Search term for medication name"
      },
      category: {
        type: "string",
        required: false,
        description: "Filter by medication category"
      }
    },
    useCases: [
      "Searching for medication information",
      "Finding medications by category",
      "Retrieving medication details for patient education"
    ],
    example: "/api/medications?query=ibuprofen"
  },

  // Health conditions endpoints
  "/api/conditions": {
    description: "Search for health conditions and their information",
    method: "GET",
    parameters: {
      query: {
        type: "string",
        required: false,
        description: "Search term for condition name"
      },
      specialty: {
        type: "string",
        required: false,
        description: "Filter conditions by related medical specialty"
      }
    },
    useCases: [
      "Searching for information about health conditions",
      "Finding conditions by related specialty",
      "Retrieving condition details for patient education"
    ],
    example: "/api/conditions?query=migraine"
  }
};

/**
 * Helper function to determine which API to use based on query intent
 * @param {string} userQuery - The user's query/message
 * @param {string} userRole - The role of the user (patient, doctor)
 * @returns {Array} - Array of recommended API endpoints with relevance scores
 */
export function recommendApis(userQuery, userRole) {
  // Common keywords that might indicate intent
  const intentKeywords = {
    appointment: ["appointment", "book", "schedule", "slot", "visit", "cancel", "reschedule"],
    doctorSearch: ["doctor", "physician", "specialist", "find a doctor", "available doctors"],
    patientRecords: ["record", "history", "medical history", "past visits", "test results"],
    medications: ["medication", "medicine", "drug", "prescription", "refill"],
    conditions: ["condition", "disease", "symptom", "diagnosis", "treatment"]
  };

  // Score each API based on query keywords and user role
  const apiScores = Object.entries(apiCatalog).map(([endpoint, details]) => {
    let score = 0;
    const queryLower = userQuery.toLowerCase();

    // Check for intent keywords in the query
    for (const [intent, keywords] of Object.entries(intentKeywords)) {
      for (const keyword of keywords) {
        if (queryLower.includes(keyword.toLowerCase())) {
          // If intent matches the API's use cases, increase score
          if (details.useCases.some(useCase => 
            useCase.toLowerCase().includes(intent.toLowerCase()) || 
            useCase.toLowerCase().includes(keyword.toLowerCase()))) {
            score += 2;
          } else {
            score += 1;
          }
        }
      }
    }

    // Role-specific scoring
    if (userRole === 'doctor') {
      if (endpoint.includes('medical-records') || endpoint.includes('patient')) {
        score += 1;
      }
    } else if (userRole === 'patient') {
      if (endpoint.includes('appointments') || endpoint.includes('doctors') || 
          endpoint.includes('available-slots')) {
        score += 1;
      }
    }

    // Check for entity matches (like IDs or dates) in parameters
    for (const [paramName, paramDetails] of Object.entries(details.parameters)) {
      if (queryLower.includes(paramName.toLowerCase())) {
        score += 0.5;
      }
    }

    return {
      endpoint,
      score,
      details
    };
  });

  // Sort by score in descending order
  return apiScores
    .sort((a, b) => b.score - a.score)
    .filter(api => api.score > 0);
} 
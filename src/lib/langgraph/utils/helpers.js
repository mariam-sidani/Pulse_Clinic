/**
 * Helper functions for the LangGraph implementation
 */
import { promptTemplates, defaultPrompt } from '../prompts/role-prompts';

/**
 * Determines if a message is about medical/clinic specific topics
 * @param {string} message - The user's message
 * @param {Object} user - Optional user object to check if user is logged in
 * @returns {boolean} - True if the message is medical/clinic related or user is logged in
 */
export function isMedicalOrClinicQuery(message, user) {
  // If the user is logged in and has a valid role (not 0), treat any message as a medical/clinic query
  if (user && user.role && user.role > 0) {
    console.log('User is logged in with role', user.role, '- treating as medical query');
    return true;
  }

  const medicalKeywords = [
    'patient', 'doctor', 'appointment', 'medical', 'prescription', 
    'symptoms', 'disease', 'treatment', 'diagnosis', 'health', 
    'medicine', 'drug', 'therapy', 'clinic', 'hospital', 'emergency',
    'surgery', 'vaccine', 'checkup', 'test', 'results', 'records',
    'booking', 'schedule', 'visit'
  ];
  
  const lowercaseMessage = message.toLowerCase();
  return medicalKeywords.some(keyword => lowercaseMessage.includes(keyword));
}

/**
 * Gets the appropriate system prompt based on user role
 * @param {number} role - The user's role ID
 * @returns {string} - The system prompt for the user's role
 */
export function getSystemPromptByRole(role) {
  const { 
    generalSystemPrompt, 
    doctorSystemPrompt, 
    patientSystemPrompt, 
    adminSystemPrompt 
  } = require('../prompts/system-prompts');
  
  switch (role) {
    case 1: // Admin
      return adminSystemPrompt;
    case 2: // Doctor
      return doctorSystemPrompt;
    case 3: // Patient
      return patientSystemPrompt;
    default:
      return generalSystemPrompt;
  }
}

/**
 * Helper functions for the agent system
 */

/**
 * Get a specific prompt based on user role (doctor/patient) and agent type
 * @param {string} userRole - The user role ('doctor', 'patient', or 'general')
 * @param {string} agentType - The agent type ('planner', 'reporter', etc.)
 * @returns {string} - The appropriate prompt template
 */
export function getPromptByUserRole(userRole, agentType) {
  // Use the appropriate prompt based on user role and agent type
  const promptKey = `${userRole}_${agentType}`.toLowerCase();
  
  // If a specific prompt exists for this combination, return it
  if (promptTemplates[promptKey]) {
    return promptTemplates[promptKey];
  }
  
  // Otherwise, return the general prompt for this agent type
  return promptTemplates[`general_${agentType}`] || defaultPrompt;
}

/**
 * Format a date for display
 * @param {Date|string} date - The date to format
 * @returns {string} - The formatted date
 */
export function formatDate(date) {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  // Check if the date is valid
  if (isNaN(d.getTime())) return '';
  
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Format a time for display
 * @param {string} time - The time to format (HH:MM:SS)
 * @returns {string} - The formatted time
 */
export function formatTime(time) {
  if (!time) return '';
  
  // Parse the time string
  const [hours, minutes] = time.split(':').map(Number);
  
  // Check if the time is valid
  if (isNaN(hours) || isNaN(minutes)) return '';
  
  // Format in 12-hour format
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
} 
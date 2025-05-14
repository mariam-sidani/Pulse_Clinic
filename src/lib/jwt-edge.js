// Edge-compatible JWT implementation
// This implementation works in the Edge Runtime without requiring Node.js crypto
import * as jose from 'jose';

// WARNING: This is a simplified implementation that does NOT perform cryptographic signature validation.
// For production use, consider using the 'jose' library which is Edge-compatible and provides full JWT verification.
// Example with jose:
// import * as jose from 'jose';
// const secret = new TextEncoder().encode(process.env.JWT_SECRET);
// const { payload } = await jose.jwtVerify(token, secret);

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Base64Url encoding/decoding functions
function base64UrlEncode(str) {
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function base64UrlDecode(str) {
  // Add padding if needed
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  switch (str.length % 4) {
    case 0:
      break;
    case 2:
      str += '==';
      break;
    case 3:
      str += '=';
      break;
    default:
      throw new Error('Invalid base64url string');
  }
  
  return atob(str);
}

// Simple JWT utility for Edge Runtime
// Note: This is a simplified version for Edge Runtime that doesn't perform full signature verification
// In production, you would want to use a crypto library compatible with Edge Runtime

/**
 * Verifies a JWT token in Edge Runtime
 * More secure than the previous implementation, but still not using full cryptographic verification
 * 
 * @param {string} token - The JWT token to verify
 * @returns {object|null} - The decoded payload if valid, null otherwise
 */
export function verifyTokenEdge(token) {
  try {
    // Check if the token has the right format (header.payload.signature)
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('JWT verification error: Invalid token format');
      return null;
    }

    // Decode the payload
    const payload = jose.decodeJwt(token);
    
    // Check if the token is expired
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      console.error('JWT verification error: Token expired');
      return null;
    }

    return payload;
  } catch (error) {
    console.error('JWT verification error:', error.message);
    return null;
  }
}

/**
 * Decodes a JWT token without verification
 * 
 * @param {string} token - The JWT token to decode
 * @returns {object|null} - The decoded payload if valid format, null otherwise
 */
export function decodeTokenEdge(token) {
  try {
    return jose.decodeJwt(token);
  } catch (error) {
    console.error('JWT decode error:', error.message);
    return null;
  }
}

export default {
  verifyTokenEdge,
  decodeTokenEdge
}; 
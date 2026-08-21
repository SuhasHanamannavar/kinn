import { clerkClient, verifyToken as clerkVerifyToken } from '@clerk/clerk-sdk-node';
import dotenv from 'dotenv';

dotenv.config();

const clerkSecretKey = process.env.CLERK_SECRET_KEY;

if (!clerkSecretKey) {
  throw new Error('Missing CLERK_SECRET_KEY environment variable');
}

/**
 * Verify a Clerk session token and return the decoded payload
 */
export async function verifyToken(token) {
  try {
    if (!token) return null;
    
    // Remove 'Bearer ' prefix if present
    const cleanToken = token.replace('Bearer ', '');
    
    const decoded = await clerkVerifyToken(cleanToken);
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return null;
  }
}

/**
 * Get user details from Clerk
 */
export async function getUserDetails(userId) {
  try {
    const user = await clerkClient.users.getUser(userId);
    return {
      id: user.id,
      email: user.emailAddresses?.[0]?.emailAddress || '',
      first_name: user.firstName || '',
      last_name: user.lastName || '',
      image_url: user.imageUrl || null,
      created_at: user.createdAt
    };
  } catch (error) {
    console.error('Failed to get user details:', error.message);
    return null;
  }
}

export { clerkClient };

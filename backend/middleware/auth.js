import { verifyToken, getUserDetails } from '../services/clerk.js';
import { db } from '../services/supabase.js';

/**
 * Authentication middleware - verifies Clerk JWT token
 */
export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = await verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Attach user info to request
    req.auth = {
      userId: decoded.sub,
      sessionId: decoded.sid
    };

    // Sync user to database
    try {
      const userDetails = await getUserDetails(decoded.sub);
      if (userDetails) {
        await db.upsertUser({
          id: userDetails.id,
          email: userDetails.email,
          first_name: userDetails.first_name,
          last_name: userDetails.last_name,
          image_url: userDetails.image_url
        });
      }
    } catch (dbError) {
      console.error('User sync error:', dbError.message);
    }

    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    res.status(401).json({ error: 'Authentication failed' });
  }
}

/**
 * Optional authentication - doesn't block if no token
 */
export async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      const decoded = await verifyToken(token);
      
      if (decoded) {
        req.auth = {
          userId: decoded.sub,
          sessionId: decoded.sid
        };
      }
    }
    next();
  } catch (error) {
    next();
  }
}

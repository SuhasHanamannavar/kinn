import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getUserDetails } from '../services/clerk.js';
import { db } from '../services/supabase.js';

const router = express.Router();

// Get current user profile
router.get('/me', requireAuth, async (req, res) => {
  try {
    const userDetails = await getUserDetails(req.auth.userId);
    
    if (!userDetails) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user stats
    const reports = await db.getReportsByUser(req.auth.userId, 100);
    
    res.json({
      user: userDetails,
      stats: {
        reports_count: reports.length,
        recent_reports: reports.slice(0, 5)
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Webhook for Clerk events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    // In production, verify webhook signature
    const event = req.body;
    
    console.log('Clerk webhook received:', event.type);
    
    if (event.type === 'user.created' || event.type === 'user.updated') {
      const user = event.data;
      await db.upsertUser({
        id: user.id,
        email: user.email_addresses?.[0]?.email_address || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        image_url: user.image_url || null
      });
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export default router;

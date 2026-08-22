'use client';

import React, { useState } from 'react';
import AuthLayout from '../layout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const supabase = createBrowserClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });

      if (error) throw error;
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout 
        title="Check your email" 
        subtitle="We've sent a password reset link."
      >
        <div className="text-center py-8">
          <div 
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'rgba(5,150,105,0.1)' }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h3 className="text-[18px] font-bold text-[#1A1A1E] mb-2">Reset link sent</h3>
          <p className="text-[#5A5D6B] text-[14px] mb-6">
            Check your email for a link to reset your password. It will expire in 1 hour.
          </p>
          <Link href="/auth/sign-in">
            <Button variant="ghost">Back to sign in</Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout 
      title="Reset your password" 
      subtitle="Enter your email and we'll send you a reset link."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />

        {error && (
          <div className="text-[13px] text-[#DC2626] bg-[rgba(220,38,38,0.06)] border border-[rgba(220,38,38,0.12)] rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <Button type="submit" loading={loading} className="w-full" size="lg">
          {loading ? 'Sending...' : 'Send reset link'}
        </Button>
      </form>

      <p className="mt-6 text-center text-[13px] text-[#5A5D6B]">
        Remember your password?{' '}
        <Link href="/auth/sign-in" className="text-[#2D5F8A] font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}

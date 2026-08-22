'use client';

import React, { useState } from 'react';
import AuthLayoutWrapper from '../AuthLayoutWrapper';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Link from 'next/link';
import { createBrowserClient } from '@/supabase/client';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createBrowserClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/app/settings`,
      });

      if (error) throw error;
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayoutWrapper 
      title="Reset password" 
      subtitle="Enter your email to receive a password reset link."
    >
      {submitted ? (
        <div className="text-center py-4">
          <div className="text-3xl mb-3">ðŸ“¬</div>
          <h3 className="text-[17px] font-bold mb-2">Check your email</h3>
          <p className="text-[13.5px] text-[#5A5D6B] mb-6">
            We sent a password reset link to <b>{email}</b>.
          </p>
          <Link href="/auth/sign-in">
            <Button variant="ghost" className="w-full">
              Back to sign in
            </Button>
          </Link>
        </div>
      ) : (
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
            {loading ? 'Sending link...' : 'Send reset link'}
          </Button>

          <div className="text-center mt-4">
            <Link href="/auth/sign-in" className="text-[13px] text-[#5A5D6B] hover:text-[#1A1A1E]">
              â† Back to sign in
            </Link>
          </div>
        </form>
      )}
    </AuthLayoutWrapper>
  );
}

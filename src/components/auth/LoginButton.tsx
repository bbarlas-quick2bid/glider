'use client';

import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function LoginButton() {
  const handleLogin = () => {
    window.location.href = '/api/auth/google';
  };

  return (
    <Button
      onClick={handleLogin}
      size="lg"
      className="flex items-center gap-2"
    >
      <Mail className="h-5 w-5" />
      Sign in with Google
    </Button>
  );
}

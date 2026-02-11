'use client';

import { redirect } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function HomePage() {
  const { user } = useAuth();

  if (!user) {
    redirect('/login');
  } else {
    redirect('/dashboard');
  }

  return null;
}

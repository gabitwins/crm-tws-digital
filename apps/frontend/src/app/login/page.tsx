'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import LoginPage from '@/components/ui/gaming-login';
import { useAuth } from '@/hooks/useAuth';

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (email: string, password: string, remember: boolean) => {
    try {
      setLoading(true);
      setError('');
      
      await login(email, password);
      
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center px-4 py-12 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600">

      <div className="relative z-20 w-full max-w-md animate-fadeIn">
        <LoginPage.LoginForm 
          onSubmit={handleLogin}
          isSubmitting={loading}
          error={error}
        />
      </div>

      <footer className="absolute bottom-4 left-0 right-0 text-center text-white/80 text-sm z-20">
        © 2025 NEXO CRM. Todos os direitos reservados.
      </footer>
    </div>
  );
}

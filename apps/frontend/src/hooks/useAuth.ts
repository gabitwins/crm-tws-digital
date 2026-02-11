import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';

export const useAuth = () => {
  const { user, token, setAuth, clearAuth } = useAuthStore();

  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 Tentando login com:', { email });
      console.log('🌐 API URL:', process.env.NEXT_PUBLIC_API_URL);
      
      const response = await api.post('/auth/login', { email, password });
      console.log('✅ Resposta do login:', response.data);
      
      const { user: userData, token: userToken } = response.data;
      setAuth(userData, userToken);
      return userData;
    } catch (error: any) {
      console.error('❌ Erro no login:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  };

  const register = async (data: any) => {
    const response = await api.post('/auth/register', data);
    const { user: userData, token: userToken } = response.data;
    setAuth(userData, userToken);
    return userData;
  };

  const logout = () => {
    clearAuth();
  };

  return {
    user,
    token,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };
};

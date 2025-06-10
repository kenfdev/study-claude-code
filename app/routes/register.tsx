import { AuthForm } from '~/components/AuthForm';
import { useAuth } from '~/lib/auth-context';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';

export default function Register() {
  const navigate = useNavigate();
  const { register, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  async function handleSubmit(email: string, password: string) {
    const result = await register(email, password);
    if (result.success) {
      navigate('/');
    }
    return result;
  }

  return (
    <AuthForm
      type="register"
      onSubmit={handleSubmit}
      isLoading={isLoading}
    />
  );
}
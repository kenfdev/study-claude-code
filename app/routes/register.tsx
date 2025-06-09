import type { Route } from './+types/register';
import { redirect } from 'react-router';
import { AuthForm } from '~/components/AuthForm';
import { useAuth } from '~/lib/auth-context';
import { authService } from '~/lib/auth';

export async function loader({ request }: Route.LoaderArgs) {
  const token = authService.getToken();
  if (token) {
    const response = await authService.verifyToken();
    if (response.success) {
      throw redirect('/');
    }
  }
  return null;
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { success: false, message: 'メールアドレスとパスワードは必須です' };
  }

  try {
    const response = await authService.register({ email, password });
    if (response.success && response.token) {
      authService.saveToken(response.token);
      throw redirect('/');
    }
    return { success: false, message: response.message || '登録に失敗しました' };
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }
    return { success: false, message: 'ネットワークエラーが発生しました' };
  }
}

export default function Register() {
  const { register, isLoading } = useAuth();

  async function handleSubmit(email: string, password: string) {
    const result = await register(email, password);
    if (result.success) {
      window.location.href = '/';
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
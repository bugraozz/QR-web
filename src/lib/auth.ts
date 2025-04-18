import { redirect } from 'next/navigation';

export async function login(prevState: any, formData: FormData) {
  const email = formData.get('email');
  const password = formData.get('password');

  if (!email || !password) {
    return { error: 'Email and password are required' };
  }

  await new Promise(resolve => setTimeout(resolve, 1000));

  if (email.toString().includes('@')) {
    redirect('/dashboard');
  } else {
    return { error: 'Invalid email or password' };
  }
}

export async function checkAuth(push: (url: string) => void, setIsAuthenticated: (value: boolean) => void) {
  try {
    const response = await fetch('/api/admin/check-session');
    if (response.ok) {
      setIsAuthenticated(true);
    } else {
      push('/admin/login'); // Redirect to login if not authenticated
    }
  } catch (error) {
    console.error('Failed to verify session:', error);
    push('/admin/login');
  }
}


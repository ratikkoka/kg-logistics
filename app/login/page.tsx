'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Input,
  Card,
  CardBody,
  CardHeader,
  Divider,
} from '@heroui/react';
import { Icon } from '@iconify/react';

import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  // Check for OAuth errors in URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorParam = params.get('error');
    const errorDesc = params.get('error_description');

    if (errorParam) {
      setError(
        errorDesc || errorParam || 'An error occurred during authentication'
      );
      // Clean up URL
      router.replace('/login');
    }
  }, [router]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (signInError) {
        setError(signInError.message);
        setIsLoading(false);

        return;
      }

      if (data.user) {
        // Check if user is authorized
        const authCheck = await fetch('/api/auth/check', {
          method: 'POST',
        });

        const authData = await authCheck.json();

        if (!authData.authorized) {
          // User is not authorized, sign them out and redirect
          await supabase.auth.signOut();
          router.push('/unauthorized');

          return;
        }

        // Redirect to dashboard (authorization check will happen on the page)
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      setError('An unexpected error occurred');
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError(null);

    try {
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signInError) {
        setError(signInError.message);
        setIsGoogleLoading(false);
      }
    } catch {
      setError('An unexpected error occurred');
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className='flex min-h-screen items-center justify-center bg-[#FFFAF0] px-4 py-12'>
      <Card className='w-full max-w-md'>
        <CardHeader className='flex flex-col gap-1 px-6 pt-6'>
          <h1 className='text-2xl font-semibold'>Welcome back</h1>
          <p className='text-small text-default-500'>
            Sign in to access the lead management dashboard
          </p>
        </CardHeader>
        <CardBody className='px-6 pb-6'>
          <form className='flex flex-col gap-4' onSubmit={handleLogin}>
            {error && (
              <div className='bg-danger-50 text-danger rounded-lg p-3 text-sm'>
                {error}
              </div>
            )}

            <Button
              className='w-full'
              isDisabled={isLoading}
              isLoading={isGoogleLoading}
              startContent={<Icon icon='mdi:google' width={20} />}
              type='button'
              variant='bordered'
              onPress={handleGoogleLogin}
            >
              Continue with Google
            </Button>

            <div className='flex items-center gap-4'>
              <Divider className='flex-1' />
              <span className='text-small text-default-500'>or</span>
              <Divider className='flex-1' />
            </div>

            <Input
              required
              autoComplete='email'
              label='Email'
              placeholder='Enter your email'
              type='email'
              value={email}
              variant='bordered'
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              required
              autoComplete='current-password'
              label='Password'
              placeholder='Enter your password'
              type='password'
              value={password}
              variant='bordered'
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button
              className='w-full'
              color='primary'
              isDisabled={isGoogleLoading}
              isLoading={isLoading}
              type='submit'
            >
              Sign in
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

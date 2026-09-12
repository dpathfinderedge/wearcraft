'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, SignupInput } from '@/lib/validations';
import { useAuthStore } from '@/store';
import { Input, Button } from '@/components/ui';
import { useToast } from '@/components/ui';

export default function SignupPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { signup } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupInput) => {
    setIsLoading(true);
    const result = await signup(data);
    setIsLoading(false);

    if (result.success) {
      showToast('Account created successfully!', 'success');
      router.push('/');
    } else {
      showToast(result.error || 'Signup failed', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-sm border border-gray-200 p-8">

          <div className="text-center mb-8">
            <Link href="/" className="text-2xl font-semibold tracking-tight text-gray-900">
              WearCraft
            </Link>
            <h2 className="mt-6 text-2xl font-light text-gray-900">
              Create your account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Start shopping with WearCraft
            </p>
          </div>


          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Full name"
              {...register('name')}
              error={errors.name?.message}
              placeholder="John Doe"
              required
            />

            <Input
              label="Email address"
              type="email"
              {...register('email')}
              error={errors.email?.message}
              placeholder="you@example.com"
              required
            />

            <Input
              label="Password"
              type="password"
              {...register('password')}
              error={errors.password?.message}
              placeholder="••••••••"
              helperText="Must be at least 6 characters"
              required
            />

            <Input
              label="Confirm password"
              type="password"
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
              placeholder="••••••••"
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
            >
              Create account
            </Button>
          </form>


          <div className="mt-6">
            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                href="/auth/login"
                className="font-medium text-gray-900 hover:text-gray-700 underline underline-offset-2"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

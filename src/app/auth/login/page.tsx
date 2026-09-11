'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginInput } from '@/lib/validations';
import { useAuthStore } from '@/store';
import { Input, Button } from '@/components/ui';
import { useToast } from '@/components/ui';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const { login, isLoading } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    const result = await login(data);

    if (result.success) {
      showToast('Login successful!', 'success');
      const redirect = searchParams.get('redirect') || '/';
      router.push(redirect);
    } else {
      showToast(result.error || 'Login failed', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-sm border border-gray-200 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="text-2xl font-semibold tracking-tight text-gray-900">
              WearCraft
            </Link>
            <h2 className="mt-6 text-2xl font-light text-gray-900">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to your account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
            >
              Sign in
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6">
            <p className="text-center text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <Link
                href="/auth/signup"
                className="font-medium text-gray-900 hover:text-gray-700 underline underline-offset-2"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-sm">
          <p className="text-xs text-blue-800 text-center">
            <strong>Demo:</strong> test@wearcraft.com / password123
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <LoginForm />
    </Suspense>
  );
}


// From here

// 'use client';

// import React, { useState } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import Link from 'next/link';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { loginSchema, LoginInput } from '@/lib/validations';
// import { useAuthStore } from '@/store';
// import { Input, Button } from '@/components/ui';
// import { useToast } from '@/components/ui';

// export default function LoginPage() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const { showToast } = useToast();
//   const { login } = useAuthStore();
//   const [isLoading, setIsLoading] = useState(false);

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<LoginInput>({
//     resolver: zodResolver(loginSchema),
//   });

//   const onSubmit = async (data: LoginInput) => {
//     setIsLoading(true);
//     const result = await login(data);
//     setIsLoading(false);

//     if (result.success) {
//       showToast('Login successful!', 'success');
//       const redirect = searchParams.get('redirect') || '/';
//       router.push(redirect);
//     } else {
//       showToast(result.error || 'Login failed', 'error');
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-md w-full">
//         <div className="bg-white rounded-sm border border-gray-200 p-8">
//           {/* Header */}
//           <div className="text-center mb-8">
//             <Link href="/" className="text-2xl font-semibold tracking-tight text-gray-900">
//               WearCraft
//             </Link>
//             <h2 className="mt-6 text-2xl font-light text-gray-900">
//               Welcome back
//             </h2>
//             <p className="mt-2 text-sm text-gray-600">
//               Sign in to your account
//             </p>
//           </div>

//           {/* Form */}
//           <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//             <Input
//               label="Email address"
//               type="email"
//               {...register('email')}
//               error={errors.email?.message}
//               placeholder="you@example.com"
//               required
//             />

//             <Input
//               label="Password"
//               type="password"
//               {...register('password')}
//               error={errors.password?.message}
//               placeholder="••••••••"
//               required
//             />

//             <Button
//               type="submit"
//               variant="primary"
//               size="lg"
//               className="w-full"
//               isLoading={isLoading}
//             >
//               Sign in
//             </Button>
//           </form>

//           {/* Footer */}
//           <div className="mt-6">
//             <p className="text-center text-sm text-gray-600">
//               Don&apos;t have an account?{' '}
//               <Link
//                 href="/auth/signup"
//                 className="font-medium text-gray-900 hover:text-gray-700 underline underline-offset-2"
//               >
//                 Sign up
//               </Link>
//             </p>
//           </div>
//         </div>

//         {/* Demo Credentials */}
//         <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-sm">
//           <p className="text-xs text-blue-800 text-center">
//             <strong>Demo:</strong> Use any email and password (min 6 characters)
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }
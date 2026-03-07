import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/lib/auth';
import { LoginRequest } from '@/types/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Building, Lock } from 'lucide-react';

const loginSchema = z.object({
  tenantId: z.string().min(1, 'Tenant ID is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
  const [error, setError] = useState<string>('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginRequest) => authApi.login(credentials),
    onSuccess: (data) => {
      login(data);
      navigate('/', { replace: true });
    },
    onError: (error: any) => {
      setError(error.message || 'Login failed. Please try again.');
    },
  });

  const onSubmit = (data: LoginFormData) => {
    setError('');
    loginMutation.mutate(data as LoginRequest);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden flex">
        {/* Left Side - Login Form */}
        <div className="w-full lg:w-1/2 p-8">
          <div className="max-w-md mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Ware House</h1>
            <p className="text-gray-600 mb-8">Sign in to your account</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="email"
                  placeholder="Email"
                  className="pl-12 h-12 border-gray-300"
                  {...register('email')}
                  disabled={loginMutation.isPending}
                />
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                )}
              </div>

              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Tenant ID"
                  className="pl-12 h-12 border-gray-300"
                  {...register('tenantId')}
                  disabled={loginMutation.isPending}
                />
                {errors.tenantId && (
                  <p className="text-sm text-red-600 mt-1">{errors.tenantId.message}</p>
                )}
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="password"
                  placeholder="Password"
                  className="pl-12 h-12 border-gray-300"
                  {...register('password')}
                  disabled={loginMutation.isPending}
                />
                {errors.password && (
                  <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
                )}
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex items-center justify-between">
                <Button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-md"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Login'
                  )}
                </Button>
                <a href="#" className="text-indigo-600 hover:text-indigo-500 text-sm">
                  Forgot password?
                </a>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side - Sign Up Section */}
        <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-white">
          <div className="h-full flex flex-col justify-center items-center text-center">
            <h2 className="text-3xl font-bold mb-4">Sign up</h2>
            <p className="text-indigo-100 mb-8 max-w-sm">
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
            </p>
            <Button 
              variant="outline" 
              className="bg-transparent border-white text-white hover:bg-white hover:text-indigo-600 px-8 py-3"
            >
              Register Now!
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
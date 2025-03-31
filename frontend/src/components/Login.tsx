import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { api } from '../utils/api';
import { useRouter } from 'next/navigation'; //  Use next/navigation
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const schema = yup.object({
  phone: yup.string().required('Phone is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
}).required();

type FormData = yup.InferType<typeof schema>;

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema),
  });
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit = async (data: FormData) => {
    try {
      const response = await api.post('/login', data);
      //  Store user data in localStorage (INSECURE - use cookies in production)
      localStorage.setItem('user', JSON.stringify(response.data.user));
      router.push('/profile'); //  Redirect
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>
          Login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input {...register('phone')} id="phone" className="w-full" />
            <p className="text-red-500 text-sm">{errors.phone?.message}</p>
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input type="password" {...register('password')} id="password" className="w-full" />
            <p className="text-red-500 text-sm">{errors.password?.message}</p>
          </div>
          <Button type="submit" className="w-full">Login</Button>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </form>
      </CardContent>
    </Card>
  );
};

export default Login;
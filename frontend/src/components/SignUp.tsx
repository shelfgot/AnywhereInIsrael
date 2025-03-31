import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { api } from '../utils/api';
import { useRouter } from 'next/navigation'; //  Use next/navigation
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const schema = yup.object({
  name: yup.string().required('Name is required'),
  phone: yup.string().required('Phone is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  role: yup.string().oneOf(['student', 'host']).required('Role is required'),
}).required();

type FormData = yup.InferType<typeof schema>;

const SignUp = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema),
  });
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit = async (data: FormData) => {
    try {
      const response = await api.post('/register', data);
      router.push('/login');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Signup failed');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Sign Up</CardTitle>
        <CardDescription>
          Create an account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input {...register('name')} id="name" className="w-full" />
            <p className="text-red-500 text-sm">{errors.name?.message}</p>
          </div>
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
          <div>
            <Label htmlFor="role">Role</Label>
            <Select>
              <SelectTrigger id="role" className="w-full">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="host">Host</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-red-500 text-sm">{errors.role?.message}</p>
          </div>
          <Button type="submit" className="w-full">Sign Up</Button>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </form>
      </CardContent>
    </Card>
  );
};

export default SignUp;
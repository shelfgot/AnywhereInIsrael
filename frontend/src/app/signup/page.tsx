"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import PasswordStrengthMeter from '../../components/PasswordStrengthMeter';

const Signup = () => {
  const [errorMessage, setErrorMessage] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const router = useRouter();

  const schema = yup.object().shape({
    name: yup.string().required('Name is required').min(3, 'Name must be at least 3 characters').max(50, 'Name must be at most 50 characters'),
    phone: yup.string().required('Phone number is required').min(9, 'Phone number must be at least 9 digits').max(15, 'Phone number must be at most 15 digits'),
    role: yup.string().required('Role is required'),
    password: yup.string()
      .required('Password is required')
      .min(8, 'Password must be at least 8 characters')
      .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
      .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .matches(/[0-9]/, 'Password must contain at least one number')
      .matches(/[!@#$%^&*()]/, 'Password must contain at least one special character'),
    confirmPassword: yup.string()
      .required('Confirmation of password is required')
      .oneOf([yup.ref('password')], 'Passwords must match'),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: any) => {
    setErrorMessage('');
    try {
      const response = await axios.post('/api/register', data);
      if (response.status === 200) {
        router.push('/login');
      } else {
        setErrorMessage('An error occurred during signup. Please try again.');
      }
    } catch (error: any) {
      console.error('Error during signup:', error);
      if (error.response) {
        setErrorMessage(error.response.data.error || 'An error occurred during signup.');
      } else {
        setErrorMessage('An error occurred during signup. Please try again.');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-center mb-6">Sign Up</h2>
      {errorMessage && <div className="text-red-500 mt-2">{errorMessage}</div>}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <label className="block text-gray-700" htmlFor="name">
            Name
          </label>
          <input
            type="text"
            id="name"
            {...register('name')}
            className="w-full p-2 border border-gray-300 rounded-lg"
          />
          {errors.name && <div className="text-red-500 mt-2">{errors.name.message}</div>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700" htmlFor="phone">
            Phone Number
          </label>
          <input
            type="text"
            id="phone"
            {...register('phone')}
            className="w-full p-2 border border-gray-300 rounded-lg"
          />
          {errors.phone && <div className="text-red-500 mt-2">{errors.phone.message}</div>}
        </div>

        <div className="mb-6">
          <label className="block text-gray-700" htmlFor="role">
            Role
          </label>
          <select
            id="role"
            {...register('role')}
            className="w-full p-2 border border-gray-300 rounded-lg"
          >
            <option value="student">Student</option>
            <option value="host">Host</option>
          </select>
          {errors.role && <div className="text-red-500 mt-2">{errors.role.message}</div>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700" htmlFor="password">
            Password
          </label>
          <input
            type="password"
            id="password"
            {...register('password')}
            className="w-full p-2 border border-gray-300 rounded-lg"
            onChange={(e) => setPassword(e.target.value)}
          />
          {errors.password && <div className="text-red-500 mt-2">{errors.password.message}</div>}
          <PasswordStrengthMeter password={password} />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700" htmlFor="confirmPassword">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            {...register('confirmPassword')}
            className="w-full p-2 border border-gray-300 rounded-lg"
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {errors.confirmPassword && <div className="text-red-500 mt-2">{errors.confirmPassword.message}</div>}
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white p-2 rounded-lg hover:bg-green-700"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default Signup;

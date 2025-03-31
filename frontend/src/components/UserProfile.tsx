import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { api } from '../utils/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const profileSchema = yup.object({
  name: yup.string().required('Name is required'),
  about_me: yup.string(),
  preferences: yup.string(),
  location: yup.string().required('Location is required'),
}).required();

type ProfileFormData = yup.InferType<typeof profileSchema>;

const UserProfile = ({ userId }: { userId: number }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: yupResolver(profileSchema),
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get(`/profile/${userId}`);
        const profileData = response.data;
        setValue('name', profileData.name);
        setValue('about_me', profileData.about_me);
        setValue('preferences', profileData.preferences);
        setValue('location', profileData.location);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, setValue]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await api.put(`/profile/${userId}`, data);
      alert('Profile updated successfully!'); //  Basic feedback
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    }
  };

  if (loading) {
    return <div>Loading profile...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>User Profile</CardTitle>
        <CardDescription>Update your profile information here.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input {...register('name')} id="name" className="w-full" />
            <p className="text-red-500 text-sm">{errors.name?.message}</p>
          </div>
          <div>
            <Label htmlFor="about_me">About Me</Label>
            <Textarea {...register('about_me')} id="about_me" className="w-full" />
            <p className="text-red-500 text-sm">{errors.about_me?.message}</p>
          </div>
          <div>
            <Label htmlFor="preferences">Preferences</Label>
            <Textarea {...register('preferences')} id="preferences" className="w-full" />
            <p className="text-red-500 text-sm">{errors.preferences?.message}</p>
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Input {...register('location')} id="location" className="w-full" />
            <p className="text-red-500 text-sm">{errors.location?.message}</p>
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Updating...' : 'Update Profile'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default UserProfile;
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { api } from '../utils/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const requestSchema = yup.object({
  location: yup.string().required('Location is required'),
  num_guests: yup.number().min(1, 'Must be at least 1 guest').required('Number of guests is required'),
}).required();

type RequestFormData = yup.InferType<typeof requestSchema>;;

const StudentRequestForm = ({ studentId }: { studentId: number }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestCreated, setRequestCreated] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<RequestFormData>({
    resolver: yupResolver(requestSchema),
  });

  const onSubmit = async (data: RequestFormData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await api.post('/request', {
        student_id: studentId,
        ...data,
      });
      if (response.status === 201) {
        setRequestCreated(true);
        reset(); // Clear the form
      }

    } catch (err: any) {
      setError(err.message || 'Failed to create request');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (requestCreated) {
    return <p className="text-green-600">Your request has been submitted!</p>;
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Submit a Request</CardTitle>
        <CardDescription>
          Fill out the form below to submit your student request.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="location">Location</Label>
            <Select>
              <SelectTrigger id="location" className="w-full">
                <SelectValue placeholder="Select a location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Jerusalem">Jerusalem</SelectItem>
                <SelectItem value="Tel Aviv">Tel Aviv</SelectItem>
                <SelectItem value="Haifa">Haifa</SelectItem>
                <SelectItem value="Beer Sheva">Beer Sheva</SelectItem>
                <SelectItem value="Eilat">Eilat</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-red-500 text-sm">{errors.location?.message}</p>
          </div>
          <div>
            <Label htmlFor="num_guests">Number of Guests</Label>
            <Input type="number" {...register('num_guests', { valueAsNumber: true })} id="num_guests" className="w-full" />
            <p className="text-red-500 text-sm">{errors.num_guests?.message}</p>
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </Button>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </form>
      </CardContent>
    </Card>
  );
};

export default StudentRequestForm;
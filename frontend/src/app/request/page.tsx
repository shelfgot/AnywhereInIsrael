import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import StudentRequestForm from '../components/StudentRequestForm';

const RequestPage = () => {
  const router = useRouter();
  const [user, setUser] = useState<{ id: number; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        //  Get user from local storage
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
          router.push('/login');
          return;
        }
        const user = JSON.parse(storedUser);
        if (user.role !== 'student') {
          router.push('/profile'); //  Redirect hosts
          return
        }
        setUser({ id: user.id, role: user.role });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!user) {
    return <div>User not found.</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Submit a Request</h1>
      <StudentRequestForm studentId={user.id} />
    </div>
  );
};

export default RequestPage;
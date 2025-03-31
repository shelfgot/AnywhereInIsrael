
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import UserProfile from '../components/UserProfile';
import { api } from '../utils/api';

const ProfilePage = () => {
  const router = useRouter();
  const [user, setUser] = useState<{ id: number; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        //  In a real app, you'd get the user ID from your authentication system
        //  For this example, I'm assuming it's stored in local storage after login
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
          router.push('/login'); //  Redirect to login if not logged in
          return;
        }
        const user = JSON.parse(storedUser);
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
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
      <UserProfile userId={user.id} />
    </div>
  );
};

export default ProfilePage;
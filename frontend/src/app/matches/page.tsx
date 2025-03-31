"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MatchDetails from '../../components/MatchDetails';
import { api } from '../../utils/api';

const MatchesPage = () => {
  const router = useRouter();
  const [user, setUser] = useState<{ id: number; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [matches, setMatches] = useState<number[]>([]); // Array of match IDs

  useEffect(() => {
    const fetchUserAndMatches = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
          router.push('/login');
          return;
        }
        const user = JSON.parse(storedUser);
        setUser({ id: user.id, role: user.role });

        // Fetch matches.  Adjust the API endpoint as needed.
        let matchResponse;
        if (user.role === 'student') {
          //  Get student requests, then get matches for those requests
          const requestResponse = await api.get(`/request/student/${user.id}`);
          const requestIds = requestResponse.data.map((req: any) => req.id);

          // Fetch matches for each request.  This might need adjustment
          const allMatches: number[] = [];
          for (const requestId of requestIds) {
            const matchForRequest = await api.get(`/match?student_request_id=${requestId}`); //  Example endpoint
            if(matchForRequest.data){
              if (Array.isArray(matchForRequest.data)) {
                allMatches.push(...matchForRequest.data.map((m:any) => m.id));
              }
              else{
                 allMatches.push(matchForRequest.data.id);
              }

            }

          }
          setMatches(allMatches);

        } else if (user.role === 'host') {
            //Get matches for the host
            const hostMatches = await api.get(`/match?host_id=${user.id}`);
            if(hostMatches.data){
               if (Array.isArray(hostMatches.data)) {
                setMatches(hostMatches.data.map((m:any) => m.id));
              }
              else{
                 setMatches([hostMatches.data.id]);
              }
            }


        }
        else{
          setMatches([]);
        }


      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndMatches();
  }, [router]);

    const handleMatchConfirmation = () => {
    // Refresh matches after confirmation
    fetchUserAndMatches();
  };

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
      <h1 className="text-3xl font-bold mb-6">Your Matches</h1>
      {matches.length === 0 ? (
        <p>You have no matches yet.</p>
      ) : (
        <div className="space-y-4">
          {matches.map((matchId) => (
            <MatchDetails key={matchId} matchId={matchId} userRole={user.role} onConfirmation={handleMatchConfirmation}/>
          ))}
        </div>
      )}
    </div>
  );
};

export default MatchesPage;

import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Button } from '@/components/ui/button';

interface Match {
  id: number;
  student_request_id: number;
  host_id: number;
  host_confirmed: boolean;
  student_confirmed: boolean;
  created_at: string;
}

const MatchDetails = ({ matchId, userRole, onConfirmation }: { matchId: number, userRole: string, onConfirmation?: () => void }) => {
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const response = await api.get(`/match/${matchId}`);
        setMatch(response.data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch match details');
      } finally {
        setLoading(false);
      }
    };
    fetchMatch();
  }, [matchId]);

  const handleConfirm = async () => {
    if (!match) return;
    try {
      if (userRole === 'host') {
        await api.put(`/match/${match.id}/confirm/host`);
      } else {
        await api.put(`/match/${match.id}/confirm/student`);
      }
      setMatch({ ...match, [userRole === 'host' ? 'host_confirmed' : 'student_confirmed']: true });
      if (onConfirmation) {
        onConfirmation();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to confirm');
    }
  };

  if (loading) {
    return <div>Loading match details...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!match) {
    return <div>Match not found.</div>;
  }

  const canConfirm = (userRole === 'host' && !match.host_confirmed) ||
    (userRole === 'student' && !match.student_confirmed);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Match Details</h3>
      <p>Match ID: {match.id}</p>
      <p>Student Request ID: {match.student_request_id}</p>
      <p>Host ID: {match.host_id}</p>
      <p>Host Confirmed: {match.host_confirmed ? 'Yes' : 'No'}</p>
      <p>Student Confirmed: {match.student_confirmed ? 'Yes' : 'No'}</p>
      <p>Created At: {new Date(match.created_at).toLocaleString()}</p>
      {canConfirm && (
        <Button onClick={handleConfirm}>
          Confirm {userRole === 'host' ? 'Hosting' : 'Match'}
        </Button>
      )}
    </div>
  );
};

export default MatchDetails;
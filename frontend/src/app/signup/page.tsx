import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const Signup = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('student');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post('/api/register', { name, phone, role });
      if (response.status === 200) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Error during signup:', error);
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-center mb-6">Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700" htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700" htmlFor="phone">Phone Number</label>
          <input
            type="text"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700" htmlFor="role">Role</label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
          >
            <option value="student">Student</option>
            <option value="host">Host</option>
          </select>
        </div>

        <button type="submit" className="w-full bg-green-600 text-white p-2 rounded-lg hover:bg-green-700">
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default Signup;

import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const Login = () => {
  const [phone, setPhone] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post('/api/login', { phone });
      if (response.status === 200) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-center mb-6">Login</h2>
      <form onSubmit={handleLogin}>
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

        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700">
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;

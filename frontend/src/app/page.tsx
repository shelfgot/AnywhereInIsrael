import Link from 'next/link';
import { Button } from '../components/Button';

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h1 className="text-5xl font-extrabold text-green-600 mb-6">Anywhere in Israel</h1>
      <p className="text-xl text-gray-600 mb-8">Connect with Shabbat hosts around Israel.</p>
      <div className="flex gap-4">
        <Button href="/signup" label="Sign Up" />
        <Button href="/login" label="Login" />
      </div>
    </div>
  );
};

export default Home;

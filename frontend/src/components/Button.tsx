import Link from 'next/link';

interface ButtonProps {
  href: string;
  label: string;
}

export const Button = ({ href, label }: ButtonProps) => (
  <Link href={href} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
    {label}
  </Link>
);

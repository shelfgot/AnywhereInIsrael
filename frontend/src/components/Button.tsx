import Link from 'next/link';

type ButtonProps = {
  href: string;
  label: string;
};

export const Button = ({ href, label }: ButtonProps) => (
  <Link href={href}>
    <a className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
      {label}
    </a>
  </Link>
);

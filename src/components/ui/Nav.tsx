import Link from 'next/link';
import Typography from './Typography';

/**
 * Nav component that adheres to our design token system
 * Uses only semantic color tokens defined in tailwind.config.js
 */
export default function Nav() {
  return (
    <nav className="bg-white border-b border-neutral-200 py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Typography variant="h5" weight="bold">
          Next.js App
        </Typography>
        <div className="flex space-x-4">
          <Link href="/" className="text-neutral-700 hover:text-primary-600">
            <Typography>Home</Typography>
          </Link>
          <Link href="/about" className="text-neutral-700 hover:text-primary-600">
            <Typography>About</Typography>
          </Link>
          <Link href="/design" className="text-neutral-700 hover:text-primary-600">
            <Typography>Design System</Typography>
          </Link>
          <Link href="/admin" className="text-neutral-700 hover:text-primary-600">
            <Typography>Admin</Typography>
          </Link>
        </div>
      </div>
    </nav>
  );
} 
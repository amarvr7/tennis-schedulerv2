"use client";

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Typography from '@/components/ui/Typography';

export default function Home() {
  return (
    <div className="space-y-8">
      <section>
        <Typography variant="h1" weight="bold" className="mb-4">Next.js 15+ Boilerplate</Typography>
        <Typography variant="lead" className="text-neutral-600">
          A minimal Next.js 15+ app with TypeScript, App Router, and Tailwind CSS.
        </Typography>
      </section>

      <section className="space-y-4">
        <Typography variant="h2" weight="semibold">Features</Typography>
        <ul className="space-y-2">
          <li className="flex items-start">
            <span className="text-neutral-500 mr-2">•</span>
            <Typography>Next.js 15+ with App Router</Typography>
          </li>
          <li className="flex items-start">
            <span className="text-neutral-500 mr-2">•</span>
            <Typography>TypeScript for type safety</Typography>
          </li>
          <li className="flex items-start">
            <span className="text-neutral-500 mr-2">•</span>
            <Typography>Tailwind CSS for styling</Typography>
          </li>
          <li className="flex items-start">
            <span className="text-neutral-500 mr-2">•</span>
            <Typography>ESLint and Prettier for code quality</Typography>
          </li>
          <li className="flex items-start">
            <span className="text-neutral-500 mr-2">•</span>
            <Typography>Custom UI components</Typography>
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <Typography variant="h2" weight="semibold">Quick Links</Typography>
        <div className="flex flex-wrap gap-4">
          <Button 
            variant="primary"
            onClick={() => window.open('https://nextjs.org/docs', '_blank')}
          >
            Next.js Docs
          </Button>
          <Button 
            variant="secondary"
            onClick={() => window.open('https://tailwindcss.com/docs', '_blank')}
          >
            Tailwind Docs
          </Button>
          <Button 
            variant="outline"
            onClick={() => window.open('/admin', '_blank')}
          >
            Admin Dashboard
          </Button>
        </div>
      </section>

      <section className="bg-neutral-50 p-6 rounded-lg max-w-md">
        <Typography variant="h2" weight="semibold" className="mb-4">Newsletter</Typography>
        <div className="space-y-4">
          <Input 
            label="Email"
            type="email"
            placeholder="Enter your email"
          />
          <Button>Subscribe</Button>
        </div>
      </section>
    </div>
  );
} 
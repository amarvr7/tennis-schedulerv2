# Next.js 15+ Boilerplate

A minimal Next.js 15+ app with TypeScript, App Router, and Tailwind CSS.

## Features

- Next.js 15+ with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- ESLint and Prettier for code quality
- Firebase Authentication
- Custom UI components

## Project Structure

```
/src
  app/
    layout.tsx        # Root layout with Nav component
    page.tsx          # Home page
    design/page.tsx   # UI showcase page
    not-found.tsx     # Custom 404 page
  components/
    ui/
      Nav.tsx         # Navigation component
      Button.tsx      # Button component
      Input.tsx       # Input component
  lib/
    firebase.ts       # Firebase authentication setup
  styles/
    globals.css       # Global styles with Tailwind CSS
```

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Environment Variables

Copy the `.env.local.example` file to `.env.local` and fill in your Firebase configuration values:

```bash
cp .env.local.example .env.local
```

Then edit the `.env.local` file with your Firebase project credentials.

### Build

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

## Deployment

This project is ready to deploy on Netlify via Git CI. Connect your repository to Netlify and it will automatically build and deploy your application.

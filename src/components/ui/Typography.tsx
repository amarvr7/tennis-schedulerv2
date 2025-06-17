import { ReactNode } from 'react';

interface TypographyProps {
  children: ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'lead' | 'small' | 'subtle';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  className?: string;
}

/**
 * Typography component that adheres to our design token system
 * All text in the application should use this component to maintain consistency
 * 
 * Font Usage:
 * - Headings (h1-h6): Oswald
 * - Body text (p, lead, small, subtle): Inter
 */
export default function Typography({
  children,
  variant = 'p',
  weight = 'normal',
  className = '',
}: TypographyProps) {
  // Using only tokens defined in our tailwind config
  const variantClasses = {
    h1: 'text-4xl leading-normal font-heading',
    h2: 'text-3xl leading-normal font-heading',
    h3: 'text-2xl leading-normal font-heading',
    h4: 'text-xl leading-normal font-heading',
    h5: 'text-lg leading-normal font-heading',
    h6: 'text-base leading-normal font-heading',
    p: 'text-base leading-relaxed font-sans',
    lead: 'text-lg leading-relaxed font-sans',
    small: 'text-sm leading-normal font-sans',
    subtle: 'text-sm leading-normal text-neutral-500 font-sans',
  };

  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };

  const classes = `${variantClasses[variant]} ${weightClasses[weight]} ${className}`;

  switch (variant) {
    case 'h1':
      return <h1 className={classes}>{children}</h1>;
    case 'h2':
      return <h2 className={classes}>{children}</h2>;
    case 'h3':
      return <h3 className={classes}>{children}</h3>;
    case 'h4':
      return <h4 className={classes}>{children}</h4>;
    case 'h5':
      return <h5 className={classes}>{children}</h5>;
    case 'h6':
      return <h6 className={classes}>{children}</h6>;
    case 'lead':
      return <p className={classes}>{children}</p>;
    case 'small':
      return <small className={classes}>{children}</small>;
    case 'subtle':
      return <p className={classes}>{children}</p>;
    default:
      return <p className={classes}>{children}</p>;
  }
} 
import Typography from './Typography';

interface LoadingProps {
  /**
   * The size of the loading indicator
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /**
   * The variant color of the loading indicator
   */
  variant?: 'primary' | 'secondary' | 'neutral';
  /**
   * The type of loading indicator to display
   */
  type?: 'spinner' | 'dots' | 'progress';
  /**
   * Optional label to display below the loading indicator
   */
  label?: string;
  /**
   * Optional progress value for progress type (0-100)
   */
  progress?: number;
  /**
   * Additional className to apply
   */
  className?: string;
}

/**
 * Loading component for displaying loading states
 * Adheres to our design token system with semantic color tokens
 * defined in tailwind.config.js
 */
export default function Loading({
  size = 'md',
  variant = 'primary',
  type = 'spinner',
  label,
  progress = 0,
  className = '',
}: LoadingProps) {
  // Size mappings for different loading types
  const sizeClasses = {
    spinner: {
      sm: 'h-4 w-4 border-2',
      md: 'h-6 w-6 border-2',
      lg: 'h-8 w-8 border-3',
      xl: 'h-12 w-12 border-4',
    },
    dots: {
      sm: 'h-1 w-1',
      md: 'h-2 w-2',
      lg: 'h-3 w-3',
      xl: 'h-4 w-4',
    },
    progress: {
      sm: 'h-1',
      md: 'h-2',
      lg: 'h-3',
      xl: 'h-4',
    },
  };

  // Color mappings
  const colorClasses = {
    spinner: {
      primary: 'border-primary-200 border-t-primary',
      secondary: 'border-secondary-200 border-t-secondary',
      neutral: 'border-neutral-200 border-t-neutral',
    },
    dots: {
      primary: 'bg-primary',
      secondary: 'bg-secondary',
      neutral: 'bg-neutral',
    },
    progress: {
      primary: 'bg-primary-200',
      secondary: 'bg-secondary-200',
      neutral: 'bg-neutral-200',
    },
    progressBar: {
      primary: 'bg-primary',
      secondary: 'bg-secondary',
      neutral: 'bg-neutral',
    },
  };

  // Label size mapping
  const labelSizeClasses = {
    sm: 'text-xs mt-1',
    md: 'text-sm mt-2',
    lg: 'text-sm mt-2',
    xl: 'text-base mt-3',
  };

  // Render spinner loading type
  const renderSpinner = () => (
    <div 
      className={`
        rounded-full
        animate-spin
        ${sizeClasses.spinner[size]}
        ${colorClasses.spinner[variant]}
      `}
      role="status"
      aria-label="Loading"
    />
  );

  // Render dots loading type
  const renderDots = () => (
    <div className="flex space-x-2" role="status" aria-label="Loading">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`
            rounded-full
            ${sizeClasses.dots[size]}
            ${colorClasses.dots[variant]}
            animate-pulse
          `}
          style={{
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
    </div>
  );

  // Render progress loading type
  const renderProgress = () => (
    <div 
      className={`
        w-full max-w-xs
        rounded-full
        overflow-hidden
        ${sizeClasses.progress[size]}
        ${colorClasses.progress[variant]}
      `}
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={`
          h-full
          rounded-full
          transition-all
          duration-300
          ${colorClasses.progressBar[variant]}
        `}
        style={{ width: `${progress}%` }}
      />
    </div>
  );

  // Map the loading type to the appropriate render function
  const loadingIndicator = {
    spinner: renderSpinner,
    dots: renderDots,
    progress: renderProgress,
  }[type];

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {loadingIndicator()}
      
      {label && (
        <Typography 
          variant="small" 
          className={labelSizeClasses[size]}
        >
          {label}
        </Typography>
      )}
    </div>
  );
}

/**
 * Example component with all loading variants for the design page
 */
export function LoadingExample() {
  return (
    <div className="space-y-8">
      <div>
        <Typography variant="h5" weight="medium" className="mb-4">Spinner Variants</Typography>
        <div className="flex flex-wrap gap-8">
          <div className="flex flex-col items-center">
            <Loading type="spinner" variant="primary" />
            <Typography variant="small" className="mt-2">Primary</Typography>
          </div>
          <div className="flex flex-col items-center">
            <Loading type="spinner" variant="secondary" />
            <Typography variant="small" className="mt-2">Secondary</Typography>
          </div>
          <div className="flex flex-col items-center">
            <Loading type="spinner" variant="neutral" />
            <Typography variant="small" className="mt-2">Neutral</Typography>
          </div>
        </div>
      </div>

      <div>
        <Typography variant="h5" weight="medium" className="mb-4">Dots Variants</Typography>
        <div className="flex flex-wrap gap-8">
          <div className="flex flex-col items-center">
            <Loading type="dots" variant="primary" />
            <Typography variant="small" className="mt-2">Primary</Typography>
          </div>
          <div className="flex flex-col items-center">
            <Loading type="dots" variant="secondary" />
            <Typography variant="small" className="mt-2">Secondary</Typography>
          </div>
          <div className="flex flex-col items-center">
            <Loading type="dots" variant="neutral" />
            <Typography variant="small" className="mt-2">Neutral</Typography>
          </div>
        </div>
      </div>

      <div>
        <Typography variant="h5" weight="medium" className="mb-4">Progress Variants</Typography>
        <div className="flex flex-col gap-6 max-w-xs">
          <div>
            <Typography variant="small" className="mb-2">Primary (25%)</Typography>
            <Loading type="progress" variant="primary" progress={25} />
          </div>
          <div>
            <Typography variant="small" className="mb-2">Secondary (50%)</Typography>
            <Loading type="progress" variant="secondary" progress={50} />
          </div>
          <div>
            <Typography variant="small" className="mb-2">Neutral (75%)</Typography>
            <Loading type="progress" variant="neutral" progress={75} />
          </div>
        </div>
      </div>

      <div>
        <Typography variant="h5" weight="medium" className="mb-4">Spinner Sizes</Typography>
        <div className="flex flex-wrap gap-8 items-center">
          <div className="flex flex-col items-center">
            <Loading type="spinner" size="sm" />
            <Typography variant="small" className="mt-2">Small</Typography>
          </div>
          <div className="flex flex-col items-center">
            <Loading type="spinner" size="md" />
            <Typography variant="small" className="mt-2">Medium</Typography>
          </div>
          <div className="flex flex-col items-center">
            <Loading type="spinner" size="lg" />
            <Typography variant="small" className="mt-2">Large</Typography>
          </div>
          <div className="flex flex-col items-center">
            <Loading type="spinner" size="xl" />
            <Typography variant="small" className="mt-2">Extra Large</Typography>
          </div>
        </div>
      </div>

      <div>
        <Typography variant="h5" weight="medium" className="mb-4">With Labels</Typography>
        <div className="flex flex-wrap gap-8">
          <Loading type="spinner" label="Loading..." />
          <Loading type="dots" label="Please wait" />
          <Loading type="progress" progress={60} label="Uploading (60%)" />
        </div>
      </div>
    </div>
  );
} 
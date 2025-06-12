import { ReactNode } from 'react';
import {
  // Navigation & UI actions
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  XMarkIcon,
  PlusIcon,
  MinusIcon,
  Bars3Icon,
  MagnifyingGlassIcon,
  
  // Common actions
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  DocumentIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ShareIcon,
  
  // Status & feedback
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  QuestionMarkCircleIcon,
  CheckIcon,
  EllipsisHorizontalIcon,
  
  // User & account
  UserIcon,
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  BellIcon,
  LockClosedIcon,
  CogIcon,
} from '@heroicons/react/24/outline';

import Typography from './Typography';

// Icon size variants
type IconSize = 'sm' | 'md' | 'lg' | 'xl';

interface IconDisplayProps {
  name: string;
  icon: ReactNode;
  onClick?: () => void;
}

/**
 * IconDisplay component for showcasing individual icons with labels
 */
function IconDisplay({ name, icon, onClick }: IconDisplayProps) {
  return (
    <div 
      className={`
        flex flex-col items-center justify-center p-4 
        rounded-lg border border-neutral-200 bg-white 
        ${onClick ? 'cursor-pointer hover:bg-neutral-50' : ''}
      `}
      onClick={onClick}
    >
      <div className="mb-3">{icon}</div>
      <Typography variant="small" className="text-center text-neutral-600">
        {name}
      </Typography>
    </div>
  );
}

/**
 * Maps icon sizes to Tailwind classes
 */
export const iconSizes = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
  xl: 'h-8 w-8',
};

/**
 * Core application icons 
 * These should be consistently used throughout the application
 */
export const appIcons = {
  // Navigation
  arrowLeft: ArrowLeftIcon,
  arrowRight: ArrowRightIcon,
  arrowUp: ArrowUpIcon,
  arrowDown: ArrowDownIcon,
  chevronLeft: ChevronLeftIcon,
  chevronRight: ChevronRightIcon,
  chevronUp: ChevronUpIcon,
  chevronDown: ChevronDownIcon,
  
  // UI Actions
  close: XMarkIcon,
  menu: Bars3Icon,
  add: PlusIcon,
  remove: MinusIcon,
  search: MagnifyingGlassIcon,
  more: EllipsisHorizontalIcon,
  
  // Content Actions
  edit: PencilIcon,
  delete: TrashIcon,
  copy: DocumentDuplicateIcon,
  document: DocumentIcon,
  documentText: DocumentTextIcon,
  download: ArrowDownTrayIcon,
  upload: ArrowUpTrayIcon,
  share: ShareIcon,
  
  // Status
  success: CheckCircleIcon,
  error: ExclamationCircleIcon,
  warning: ExclamationTriangleIcon,
  info: InformationCircleIcon,
  help: QuestionMarkCircleIcon,
  check: CheckIcon,
  
  // User
  user: UserIcon,
  userCircle: UserCircleIcon,
  email: EnvelopeIcon,
  phone: PhoneIcon,
  notification: BellIcon,
  security: LockClosedIcon,
  settings: CogIcon,
};

interface AppIconProps {
  /**
   * Name of the icon to display from the appIcons set
   */
  name: keyof typeof appIcons;
  /**
   * Size of the icon
   */
  size?: IconSize;
  /**
   * CSS class to apply to the icon
   */
  className?: string;
}

/**
 * AppIcon component for consistent icon usage
 * Uses only icons from our predefined set for consistency
 */
export function AppIcon({ name, size = 'md', className = '' }: AppIconProps) {
  const IconComponent = appIcons[name];
  return <IconComponent className={`${iconSizes[size]} ${className}`} />;
}

// Groupings for the design page
const iconGroups = [
  {
    title: 'Navigation',
    icons: [
      { name: 'Arrow Left', icon: <ArrowLeftIcon className="h-6 w-6" /> },
      { name: 'Arrow Right', icon: <ArrowRightIcon className="h-6 w-6" /> },
      { name: 'Arrow Up', icon: <ArrowUpIcon className="h-6 w-6" /> },
      { name: 'Arrow Down', icon: <ArrowDownIcon className="h-6 w-6" /> },
      { name: 'Chevron Left', icon: <ChevronLeftIcon className="h-6 w-6" /> },
      { name: 'Chevron Right', icon: <ChevronRightIcon className="h-6 w-6" /> },
      { name: 'Chevron Up', icon: <ChevronUpIcon className="h-6 w-6" /> },
      { name: 'Chevron Down', icon: <ChevronDownIcon className="h-6 w-6" /> },
    ],
  },
  {
    title: 'UI Actions',
    icons: [
      { name: 'Close', icon: <XMarkIcon className="h-6 w-6" /> },
      { name: 'Menu', icon: <Bars3Icon className="h-6 w-6" /> },
      { name: 'Add', icon: <PlusIcon className="h-6 w-6" /> },
      { name: 'Remove', icon: <MinusIcon className="h-6 w-6" /> },
      { name: 'Search', icon: <MagnifyingGlassIcon className="h-6 w-6" /> },
      { name: 'More', icon: <EllipsisHorizontalIcon className="h-6 w-6" /> },
    ],
  },
  {
    title: 'Content Actions',
    icons: [
      { name: 'Edit', icon: <PencilIcon className="h-6 w-6" /> },
      { name: 'Delete', icon: <TrashIcon className="h-6 w-6" /> },
      { name: 'Copy', icon: <DocumentDuplicateIcon className="h-6 w-6" /> },
      { name: 'Document', icon: <DocumentIcon className="h-6 w-6" /> },
      { name: 'Document Text', icon: <DocumentTextIcon className="h-6 w-6" /> },
      { name: 'Download', icon: <ArrowDownTrayIcon className="h-6 w-6" /> },
      { name: 'Upload', icon: <ArrowUpTrayIcon className="h-6 w-6" /> },
      { name: 'Share', icon: <ShareIcon className="h-6 w-6" /> },
    ],
  },
  {
    title: 'Status',
    icons: [
      { name: 'Success', icon: <CheckCircleIcon className="h-6 w-6" /> },
      { name: 'Error', icon: <ExclamationCircleIcon className="h-6 w-6" /> },
      { name: 'Warning', icon: <ExclamationTriangleIcon className="h-6 w-6" /> },
      { name: 'Info', icon: <InformationCircleIcon className="h-6 w-6" /> },
      { name: 'Help', icon: <QuestionMarkCircleIcon className="h-6 w-6" /> },
      { name: 'Check', icon: <CheckIcon className="h-6 w-6" /> },
    ],
  },
  {
    title: 'User',
    icons: [
      { name: 'User', icon: <UserIcon className="h-6 w-6" /> },
      { name: 'User Circle', icon: <UserCircleIcon className="h-6 w-6" /> },
      { name: 'Email', icon: <EnvelopeIcon className="h-6 w-6" /> },
      { name: 'Phone', icon: <PhoneIcon className="h-6 w-6" /> },
      { name: 'Notification', icon: <BellIcon className="h-6 w-6" /> },
      { name: 'Security', icon: <LockClosedIcon className="h-6 w-6" /> },
      { name: 'Settings', icon: <CogIcon className="h-6 w-6" /> },
    ],
  },
];

/**
 * Icons showcase component for the design page
 */
export default function Icons() {
  return (
    <div className="space-y-10">
      {iconGroups.map((group) => (
        <div key={group.title} className="space-y-4">
          <Typography variant="h5" weight="medium">
            {group.title}
          </Typography>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {group.icons.map((icon) => (
              <IconDisplay
                key={icon.name}
                name={icon.name}
                icon={icon.icon}
              />
            ))}
          </div>
        </div>
      ))}
      
      <div className="space-y-4">
        <Typography variant="h5" weight="medium">
          Icon Sizes
        </Typography>
        <div className="flex items-end gap-8 flex-wrap">
          <div className="flex flex-col items-center">
            <UserCircleIcon className="h-4 w-4 mb-2" />
            <Typography variant="small">Small (sm)</Typography>
          </div>
          <div className="flex flex-col items-center">
            <UserCircleIcon className="h-5 w-5 mb-2" />
            <Typography variant="small">Medium (md)</Typography>
          </div>
          <div className="flex flex-col items-center">
            <UserCircleIcon className="h-6 w-6 mb-2" />
            <Typography variant="small">Large (lg)</Typography>
          </div>
          <div className="flex flex-col items-center">
            <UserCircleIcon className="h-8 w-8 mb-2" />
            <Typography variant="small">Extra Large (xl)</Typography>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <Typography variant="h5" weight="medium">
          Usage Example
        </Typography>
        <div className="bg-neutral-50 p-6 rounded-lg border border-neutral-200">
          <Typography className="mb-4">To use icons consistently in your components:</Typography>
          <div className="bg-neutral-900 text-white p-4 rounded-md font-mono text-sm overflow-x-auto">
            <pre>{`import { AppIcon } from '@/components/ui/Icons';

function MyComponent() {
  return (
    <div>
      <button className="flex items-center gap-2">
        <AppIcon name="add" size="sm" />
        Add Item
      </button>
      
      <div className="flex items-center text-success-700">
        <AppIcon name="success" className="mr-2 text-success" />
        Operation completed successfully
      </div>
    </div>
  );
}`}</pre>
          </div>
        </div>
      </div>
    </div>
  );
} 
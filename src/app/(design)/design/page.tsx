"use client";

import { useMediaQuery } from 'react-responsive';
import Button from '@/components/ui/Button';
import Typography from '@/components/ui/Typography';
import Colors from '@/components/ui/Colors';
import Card from '@/components/ui/Card';

export default function DesignPage() {
  const isMobile = useMediaQuery({ maxWidth: 768 });

  return (
    <div className="min-h-screen bg-white">
      {/* Main content with all the UI components */}
      <div className={`${isMobile ? 'pt-4' : ''} px-6 py-8 max-w-6xl`}>
      
        {/* Typography Section */}
        <section id="typography" className="mb-16">
          <Typography variant="h2" weight="bold" className="mb-6 pb-2 border-b border-neutral-200">Typography</Typography>
          <div className="space-y-8">
            <div className="space-y-4">
              <Typography variant="h1" weight="bold">Heading 1 (text-4xl)</Typography>
              <Typography variant="h2" weight="bold">Heading 2 (text-3xl)</Typography>
              <Typography variant="h3" weight="bold">Heading 3 (text-2xl)</Typography>
              <Typography variant="h4" weight="bold">Heading 4 (text-xl)</Typography>
              <Typography variant="h5" weight="bold">Heading 5 (text-lg)</Typography>
              <Typography variant="h6" weight="bold">Heading 6 (text-base)</Typography>
            </div>
            
            <div className="space-y-4">
              <Typography variant="lead">
                Lead paragraph text that stands out a bit more than regular paragraph text.
              </Typography>
              <Typography>
                Regular paragraph text. This is the default text style used for most content in the application.
                It should be readable and have good contrast against the background.
              </Typography>
              <Typography variant="small">
                Small text is used for less important information or supporting content.
              </Typography>
              <Typography variant="subtle">
                Subtle text is used for even less important information, often in a lighter color.
              </Typography>
            </div>
            
            <div className="space-y-4">
              <Typography weight="normal">Normal font weight (400)</Typography>
              <Typography weight="medium">Medium font weight (500)</Typography>
              <Typography weight="semibold">Semibold font weight (600)</Typography>
              <Typography weight="bold">Bold font weight (700)</Typography>
            </div>
          </div>
        </section>
        
        {/* Colors Section */}
        <section id="colors" className="mb-16">
          <Typography variant="h2" weight="bold" className="mb-6 pb-2 border-b border-neutral-200">Colors</Typography>
          <Colors />
        </section>
        
        {/* Card Section */}
        <section id="cards" className="mb-16">
          <Typography variant="h2" weight="bold" className="mb-6 pb-2 border-b border-neutral-200">Card</Typography>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="Default Card">
              <Typography>This is the content of a default card without a footer.</Typography>
            </Card>
            
            <Card
              title="Card with Footer"
              footer={
                <div className="flex justify-end">
                  <Button variant="primary" size="sm">Action</Button>
                </div>
              }
            >
              <Typography>This card has a title and a footer with an action button.</Typography>
            </Card>
            
            <Card variant="bordered" title="Bordered Card">
              <Typography>This card has a border styling.</Typography>
            </Card>
            
            <Card variant="elevated" title="Elevated Card">
              <Typography>This card has a shadow to make it appear elevated from the page.</Typography>
            </Card>
          </div>
        </section>
        
        {/* Add the rest of the sections... */}
      </div>
    </div>
  );
} 
import Typography from '@/components/ui/Typography';

export default function About() {
  return (
    <div className="space-y-6">
      <section>
        <Typography variant="h1" weight="bold" className="mb-4">About Us</Typography>
        <Typography variant="lead" className="text-neutral-600">
          Learn more about our company and mission.
        </Typography>
      </section>

      <section className="space-y-4">
        <Typography variant="h2" weight="semibold">Our Story</Typography>
        <Typography>
          This is a placeholder for the about page. In a real application, you would
          include information about your company, team, mission, and values.
        </Typography>
        <Typography>
          This boilerplate project demonstrates how to structure a Next.js application
          with both public-facing content and an admin section.
        </Typography>
      </section>

      <section className="space-y-4">
        <Typography variant="h2" weight="semibold">Our Team</Typography>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Team member cards would go here */}
          <div className="bg-neutral-50 p-4 rounded-lg">
            <Typography weight="semibold">John Doe</Typography>
            <Typography variant="subtle">CEO & Founder</Typography>
          </div>
          <div className="bg-neutral-50 p-4 rounded-lg">
            <Typography weight="semibold">Jane Smith</Typography>
            <Typography variant="subtle">CTO</Typography>
          </div>
          <div className="bg-neutral-50 p-4 rounded-lg">
            <Typography weight="semibold">Bob Johnson</Typography>
            <Typography variant="subtle">Lead Developer</Typography>
          </div>
        </div>
      </section>
    </div>
  );
} 
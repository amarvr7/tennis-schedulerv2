import Typography from '@/components/ui/Typography';

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <section>
        <Typography variant="h1" weight="bold" className="mb-2 text-2xl sm:text-3xl md:text-4xl">
          Admin Dashboard
        </Typography>
        <Typography variant="lead" className="text-neutral-600">
          Welcome to the administration area.
        </Typography>
      </section>

      {/* Dashboard content with responsive grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Analytics Card */}
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-neutral-200">
          <Typography variant="h6" weight="semibold" className="mb-2">Analytics</Typography>
          <Typography variant="p" className="text-neutral-600">
            View website traffic and user engagement metrics.
          </Typography>
        </div>

        {/* Users Card */}
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-neutral-200">
          <Typography variant="h6" weight="semibold" className="mb-2">Users</Typography>
          <Typography variant="p" className="text-neutral-600">
            Manage user accounts and permissions.
          </Typography>
        </div>

        {/* Content Card */}
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-neutral-200">
          <Typography variant="h6" weight="semibold" className="mb-2">Content</Typography>
          <Typography variant="p" className="text-neutral-600">
            Edit website content and media assets.
          </Typography>
        </div>
      </section>
    </div>
  );
} 
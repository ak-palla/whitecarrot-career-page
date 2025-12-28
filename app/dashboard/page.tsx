import { CompaniesList } from './companies-list';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage your companies, career pages, and job postings. Create and customize career pages to attract top talent.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardPage() {
    return (
        <div className="flex flex-1 flex-col gap-8 pt-6 px-6">
            <CompaniesList />
        </div>
    );
}

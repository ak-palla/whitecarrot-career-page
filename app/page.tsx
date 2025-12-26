import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Home",
  description: "Lisco - Build amazing career pages for your company. Manage job postings and attract top talent.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function Home() {
  redirect('/dashboard');
}

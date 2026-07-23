import type { Metadata } from 'next';
import Link from 'next/link';
import { ContactForm } from '@/components/contact/ContactForm';
import { Logo } from '@/components/brand/Logo';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Contact',
  description: `Get in touch with the ${site.name} team — questions, support, partnerships, or feedback.`,
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <Link href="/" className="mb-8 flex items-center gap-2 font-semibold tracking-tight">
        <Logo size={26} />
        {site.name}
      </Link>
      <h1 className="text-2xl font-semibold">Contact us</h1>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
        Questions, support, or partnerships — send us a note and we&apos;ll reply by email.
      </p>
      <div className="mt-8">
        <ContactForm />
      </div>
    </main>
  );
}

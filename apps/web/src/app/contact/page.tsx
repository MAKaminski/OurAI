import type { Metadata } from 'next';
import { SiteNav } from '@/components/landing/SiteNav';
import { Footer } from '@/components/landing/Footer';
import { ContactForm } from '@/components/contact/ContactForm';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Contact',
  description: `Get in touch with the ${site.name} team — questions, support, partnerships, or feedback.`,
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <>
      <SiteNav />
      <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
        <span className="font-mono text-xs uppercase tracking-[0.15em] text-zinc-500">Contact</span>
        <h1 className="mt-4 text-3xl font-semibold tracking-[-0.02em] text-zinc-50">Contact us</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Questions, support, or partnerships — send us a note and we&apos;ll reply by email.
        </p>
        <div className="mt-8">
          <ContactForm />
        </div>
      </main>
      <Footer />
    </>
  );
}

import Link from 'next/link';

export default async function CompanyHomePage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = await params;
  const nav = [
    { href: `/companies/${companyId}/ideas`, label: 'Ideas' },
    { href: `/companies/${companyId}/work`, label: 'Outstanding work' },
    { href: `/companies/${companyId}/settings`, label: 'Settings' },
  ];
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-semibold">Company</h1>
      <p className="mt-1 text-sm text-neutral-500">{companyId}</p>
      <nav className="mt-6 flex gap-4">
        {nav.map((n) => (
          <Link key={n.href} href={n.href} className="text-sm font-medium underline">
            {n.label}
          </Link>
        ))}
      </nav>
    </main>
  );
}

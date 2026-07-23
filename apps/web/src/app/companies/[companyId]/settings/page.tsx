import { SettingsManager } from '@/components/settings/SettingsManager';

export const metadata = {
  title: 'Settings',
};

export default async function SettingsPage({ params }: { params: Promise<{ companyId: string }> }) {
  const { companyId } = await params;
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
        Bring your own keys. These values configure the agents that run on this company&apos;s repo
        — your model API key, GitHub token, and any other config.
      </p>
      <div className="mt-8">
        <SettingsManager companyId={companyId} />
      </div>
    </main>
  );
}

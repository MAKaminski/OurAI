import { CompanyCreateForm } from '@/components/company/CompanyCreateForm';

export default function NewCompanyPage() {
  return (
    <main className="mx-auto max-w-lg px-6 py-16">
      <h1 className="text-2xl font-semibold">Create a company</h1>
      <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
        One company maps to one GitHub repo. This is the front door — you&apos;ll intake ideas next.
      </p>
      <div className="mt-8">
        <CompanyCreateForm />
      </div>
    </main>
  );
}

'use client';

import { useState } from 'react';
import { ALL_ROLES, type MemberRole } from '@ourai/shared';

/** "Act as" role selector — cosmetic label + presence color (docs plan v2 §2). */
export function ActAsRoleDropdown() {
  const [role, setRole] = useState<MemberRole>('dev');
  return (
    <select
      value={role}
      onChange={(e) => setRole(e.target.value as MemberRole)}
      className="rounded-md border border-neutral-300 bg-white px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-900"
      aria-label="Act as role"
    >
      {ALL_ROLES.map((r) => (
        <option key={r} value={r}>
          {r}
        </option>
      ))}
    </select>
  );
}

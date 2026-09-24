'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { FiscalComparator } from '../../src/components/FiscalComparator';

export default function FiscalPage() {
  return (
    <div className="social-route-shell">
      <div className="social-route-topbar">
        <Link href="/" className="social-route-backlink">
          <ArrowLeft size={16} />
          Volver al panel principal
        </Link>
      </div>

      <FiscalComparator />
    </div>
  );
}

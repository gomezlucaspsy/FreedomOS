'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { SocialEngineeringSankey } from '../../src/components/SocialEngineeringSankey';
import { getStoredMigrantProfile } from '../../src/core/MigrantProfileStore';
import { getPsychMemoryCycle } from '../../src/core/PsychMemoryCycle';
import { getScreeningSessions } from '../../src/core/ScreeningSessionStore';
import type { MigrantPerson } from '../../src/models/MigrantPerson';
import type { PsychProfile } from '../../src/models/PsychProfile';

export default function SocialEngineeringPage() {
  const [migrantPerson, setMigrantPerson] = useState<MigrantPerson | null>(null);
  const [psychProfile, setPsychProfile] = useState<PsychProfile | null>(null);
  const [screeningSessionsCount, setScreeningSessionsCount] = useState(0);

  useEffect(() => {
    const storedMigrant = getStoredMigrantProfile();
    const storedPsych = getPsychMemoryCycle().activeEntry?.profile ?? null;
    const sessions = getScreeningSessions();

    setMigrantPerson(storedMigrant);
    setPsychProfile(storedPsych);
    setScreeningSessionsCount(sessions.length);
  }, []);

  return (
    <div className="social-route-shell">
      <div className="social-route-topbar">
        <Link href="/" className="social-route-backlink">
          <ArrowLeft size={16} />
          Volver al panel principal
        </Link>
      </div>

      <SocialEngineeringSankey
        migrantPerson={migrantPerson}
        psychProfile={psychProfile}
        screeningSessionsCount={screeningSessionsCount}
      />
    </div>
  );
}

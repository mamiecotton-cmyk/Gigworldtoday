'use client';

import dynamic from 'next/dynamic';

const ExitSurvey = dynamic(() => import('@/components/ExitSurvey'), {
  ssr: false,
});

export default function ExitSurveyWrapper() {
  return <ExitSurvey />;
}

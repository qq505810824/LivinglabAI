import { Header } from '@/components/layout/Header';
import React from 'react';

export default function OrgLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background-primary">
      <Header variant="organization" />
      <main className="pt-[56px]">
        {children}
      </main>
      {/* 机构端无 Footer，专注于工作台 */}
    </div>
  );
}

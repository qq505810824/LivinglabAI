import React from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-primary relative overflow-hidden">
      {/* 背景装饰光晕 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary opacity-10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-success opacity-10 rounded-full blur-3xl" />
      </div>

      {/* 内容区域 */}
      <div className="relative z-10 w-full max-w-md px-6">
        {children}
      </div>
    </div>
  );
}

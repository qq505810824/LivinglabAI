import React from 'react';

interface CardLoaderProps {
  count?: number;
}

export const CardLoader: React.FC<CardLoaderProps> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-background-secondary border border-border rounded-xl p-5 animate-pulse"
        >
          {/* 公司标识骨架 */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-background-tertiary rounded-lg" />
            <div className="h-3 bg-background-tertiary rounded w-24" />
          </div>

          {/* 标题骨架 */}
          <div className="h-5 bg-background-tertiary rounded w-full mb-2" />
          <div className="h-5 bg-background-tertiary rounded w-2/3 mb-3" />

          {/* 标签骨架 */}
          <div className="flex gap-2 mb-3">
            <div className="h-5 bg-background-tertiary rounded w-16" />
            <div className="h-5 bg-background-tertiary rounded w-16" />
            <div className="h-5 bg-background-tertiary rounded w-12" />
          </div>

          {/* 描述骨架 */}
          <div className="space-y-2 mb-4">
            <div className="h-3 bg-background-tertiary rounded w-full" />
            <div className="h-3 bg-background-tertiary rounded w-5/6" />
          </div>

          {/* 底部骨架 */}
          <div className="flex justify-between pt-3 border-t border-border">
            <div className="h-3 bg-background-tertiary rounded w-20" />
            <div className="h-3 bg-background-tertiary rounded w-16" />
          </div>
        </div>
      ))}
    </div>
  );
};

import React from 'react';

export const Skeleton = ({ className = '', ...props }) => {
  return (
    <div
      className={`animate-pulse bg-[#ECECE7] rounded-xl ${className}`}
      {...props}
    />
  );
};

export const CardSkeleton = () => (
  <div className="bg-brand-surface rounded-2xl border border-brand-border p-6 shadow-soft space-y-4">
    <div className="flex justify-between items-center">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
    <Skeleton className="h-6 w-3/4" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-2/3" />
    <div className="pt-4 flex justify-between items-center border-t border-brand-border/40">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-8 w-28 rounded-xl" />
    </div>
  </div>
);

export default Skeleton;

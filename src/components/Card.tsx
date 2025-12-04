import { ReactNode } from 'react';

interface CardProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export default function Card({ title, children, className = '' }: CardProps) {
  return (
    <div className={`border-4 border-black bg-white p-6 shadow-[8px_8px_0_#000] ${className}`}>
      <h2 className="mb-4 border-b-4 border-black pb-2 text-xl text-black uppercase tracking-tight">
        {title}
      </h2>
      {children}
    </div>
  );
}

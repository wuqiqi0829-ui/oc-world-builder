import clsx from 'clsx';
import type { ReactNode, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

export default function Card({ children, hover, padding = 'md', className, ...props }: CardProps) {
  const padMap = { sm: 'p-3', md: 'p-4', lg: 'p-6' };
  return (
    <div
      className={clsx(
        'card',
        padMap[padding],
        hover && 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all duration-150',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

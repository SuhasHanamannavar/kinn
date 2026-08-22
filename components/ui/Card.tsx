import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  hoverable = false, 
  className, 
  children, 
  ...props 
}) => {
  return (
    <div
      className={cn(
        'bg-white border border-[rgba(0,0,0,0.08)] rounded-[14px] transition-all duration-250',
        hoverable && 'hover:border-[rgba(0,0,0,0.14)] hover:shadow-card-hover cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;

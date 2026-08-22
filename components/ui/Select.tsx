import React from 'react';
import { cn } from '@/lib/utils';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({ 
  label, 
  options, 
  className, 
  id,
  ...props 
}) => {
  const inputId = id || props.name;
  
  return (
    <div>
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-[12.5px] font-semibold text-[#5A5D6B] mb-[6px]"
        >
          {label}
        </label>
      )}
      <select
        id={inputId}
        className={cn(
          'px-[14px] py-[10px] border border-[rgba(0,0,0,0.12)] rounded-[10px] text-[13px] font-sans text-[#1A1A1E] bg-white outline-none cursor-pointer transition-all duration-180',
          'focus:border-[rgba(26,26,30,0.3)] focus:shadow-[0_0_0_3px_rgba(26,26,30,0.06)]',
          className
        )}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
};

export default Select;

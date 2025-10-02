// components/ui/input.tsx
import { cn } from '@/lib/utils';
import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  required?: boolean;
  helpText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, required, helpText, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="flex text-sm font-medium text-[#1D2025]">
            {label}
            {required && <span className="text-[#E53E3E] ml-1">*</span>}
          </label>
        )}
        <input
          className={cn(
            'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-[#7D7F83] focus:outline-none focus:ring-2 focus:ring-[#8952E0] focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
          ref={ref}
          {...props}
        />
        {helpText && (
          <p className="text-xs text-[#1D2025]">{helpText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };

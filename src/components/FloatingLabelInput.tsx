import { useState, InputHTMLAttributes } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface FloatingLabelInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  id: string;
  label: string;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function FloatingLabelInput({
  id,
  label,
  type = 'text',
  value,
  error,
  disabled,
  onChange,
  ...props
}: FloatingLabelInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value !== undefined && value !== '';
  const isFloating = isFocused || hasValue;

  return (
    <div className="relative">
      <div className="relative">
        <Input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          className={`h-12 px-4 pt-6 pb-2 bg-background text-foreground border rounded-md transition-all duration-200 ease-in-out focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-gray-100 disabled:cursor-not-allowed ${
            error ? 'border-error focus:border-error focus:ring-error/20' : 'border-border'
          }`}
          aria-describedby={error ? `${id}-error` : undefined}
          {...props}
        />
        <Label
          htmlFor={id}
          className={`absolute left-4 text-gray-400 pointer-events-none transition-all duration-200 ease-in-out ${
            isFloating
              ? 'top-2 text-caption'
              : 'top-1/2 -translate-y-1/2 text-body'
          } ${error ? 'text-error' : ''}`}
        >
          {label}
        </Label>
      </div>
      {error && (
        <p
          id={`${id}-error`}
          className="mt-2 text-body-sm text-error"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
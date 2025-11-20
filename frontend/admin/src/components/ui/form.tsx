import * as React from 'react';
import { cn } from '@/lib/utils';

interface FormContextValue {
  errors: Record<string, string>;
}

const FormContext = React.createContext<FormContextValue>({ errors: {} });

export const Form = React.forwardRef<HTMLFormElement, React.FormHTMLAttributes<HTMLFormElement>>(
  ({ className, ...props }, ref) => {
    const [errors, setErrors] = React.useState<Record<string, string>>({});

    return (
      <FormContext.Provider value={{ errors }}>
        <form ref={ref} className={cn('space-y-4', className)} {...props} />
      </FormContext.Provider>
    );
  },
);
Form.displayName = 'Form';

export const FormField = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn('space-y-2', className)} {...props} />;
  },
);
FormField.displayName = 'FormField';

export const FormLabel = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => {
    return <label ref={ref} className={cn('text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70', className)} {...props} />;
  },
);
FormLabel.displayName = 'FormLabel';

export const FormMessage = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    return <p ref={ref} className={cn('text-sm font-medium text-destructive', className)} {...props} />;
  },
);
FormMessage.displayName = 'FormMessage';


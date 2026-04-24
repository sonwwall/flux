import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

const ErrorMessage = ({ 
  title = "Error", 
  message, 
  action,
  onAction,
  variant = "destructive" 
}) => {
  return (
    <Alert variant={variant}>
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        {message}
        {action && onAction && (
          <Button variant="link" onClick={onAction} className="ml-2 p-0 h-auto">
            {action}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default ErrorMessage;
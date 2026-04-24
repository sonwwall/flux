import React from 'react';

export const Alert = ({ children, variant }) => (
  <div data-testid="alert" data-variant={variant}>{children}</div>
);

export const AlertDescription = ({ children }) => (
  <div data-testid="alert-description">{children}</div>
);

export const AlertTitle = ({ children }) => (
  <div data-testid="alert-title">{children}</div>
);

import React from 'react';

interface FormLayoutProps {
  children: React.ReactNode;
}

export const FormLayout: React.FC<FormLayoutProps> = ({ children }) => {
  return (
    <div className="space-y-6">
      {children}
    </div>
  );
};

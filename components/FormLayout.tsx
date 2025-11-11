import React from 'react';

interface FormLayoutProps {
  children: React.ReactNode;
}

export const FormLayout: React.FC<FormLayoutProps> = ({ children }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 items-start">
      {children}
    </div>
  );
};

import React from 'react';

interface DataFormLayoutProps {
  children: React.ReactNode;
}

export const DataFormLayout: React.FC<DataFormLayoutProps> = ({ children }) => {
  return (
    <div className="space-y-6">
      {children}
    </div>
  );
};
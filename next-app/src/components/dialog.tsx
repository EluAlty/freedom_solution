import React from 'react';

interface DialogProps {
  open: boolean;
  onOpenChange: () => void;
  children: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/50" 
        onClick={onOpenChange}
      />
      <div className="relative bg-white rounded-lg shadow-xl">
        {children}
      </div>
    </div>
  );
};

export const DialogContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <div className={`p-6 ${className || ''}`}>
    {children}
  </div>
);

export const DialogHeader: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => (
  <div className="mb-4">
    {children}
  </div>
);

export const DialogTitle: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => (
  <h2 className="text-xl font-semibold">
    {children}
  </h2>
); 
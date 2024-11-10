declare module 'sonner' {
  export const toast: {
    success: (message: string) => void;
    error: (message: string) => void;
  };
  export const Toaster: React.FC<{ richColors?: boolean; position?: string }>;
} 
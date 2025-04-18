"use client";

import { createContext, useContext, ReactNode } from "react";

interface ToastContextType {
  toast: (options: { title: string; description: string; duration?: number }) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const toast = (options: { title: string; description: string; duration?: number }) => {
    console.log("Toast:", options);
    // Implement your toast logic here (e.g., using a toast library)
  };

  return <ToastContext.Provider value={{ toast }}>{children}</ToastContext.Provider>;
};

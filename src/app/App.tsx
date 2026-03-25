import React from 'react';
import { RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import { AppProvider } from './contexts/AppContext';
import { router } from './routes';
import { SupportButton } from './components/SupportButton';
import { AIPermissionManager } from './components/AIPermissionManager';

export default function App() {
  return (
    <AppProvider>
      <RouterProvider router={router} />
      <Toaster 
        position="top-right" 
        richColors 
        theme="dark"
      />
      <SupportButton />
      <AIPermissionManager />
    </AppProvider>
  );
}
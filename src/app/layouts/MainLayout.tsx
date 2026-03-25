import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router';
import { useApp } from '../contexts/AppContext';
import { TopBar } from '../components/TopBar';

export function MainLayout() {
  const { user, isLoading } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <main className="pt-16 md:pt-24">
        <Outlet />
      </main>
    </div>
  );
}
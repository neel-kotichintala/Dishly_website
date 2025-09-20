import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { BottomNavigation } from './BottomNavigation';
import { Header } from './Header';

export const Layout = () => {
  const location = useLocation();
  const hideNavOnRoutes = ['/auth'];
  const showNav = !hideNavOnRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {showNav && <Header />}
      <main className="pb-16">
        <Outlet />
      </main>
      {showNav && <BottomNavigation />}
    </div>
  );
};
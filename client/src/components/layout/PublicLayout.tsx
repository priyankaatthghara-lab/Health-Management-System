import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-warm-bg text-primary-text font-inter antialiased selection:bg-burgundy-100 selection:text-burgundy-900">
      {/* Public Navigation */}
      <Navbar />

      {/* Main Page Area */}
      <main className="flex-1 min-h-[calc(100vh-16rem)]">
        <Outlet />
      </main>

      {/* Public Footer */}
      <Footer />
    </div>
  );
};

export default PublicLayout;

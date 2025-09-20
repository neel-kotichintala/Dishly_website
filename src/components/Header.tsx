import React from 'react';
import { Search, Menu, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import logo from '@/assets/logo.png';

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Dishly" className="h-8 w-8" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
              Dishly
            </h1>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link to="/search">
              <Button variant="ghost" size="icon">
                <Search className="h-5 w-5" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon">
              <Plus className="h-5 w-5" />
            </Button>
            <Link to="/profile">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
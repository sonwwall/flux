import React from 'react';
import { Button } from '@/components/ui/button';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Flux Blog</h1>
            </div>
          </div>
          
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">Welcome, {user.username}</span>
                <Button onClick={logout} variant="outline">
                  Logout
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
import React from 'react';
import { Button } from '@/components/ui/button';

const Sidebar = () => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', path: '/' },
    { id: 'posts', label: 'Posts', path: '/posts' },
    { id: 'categories', label: 'Categories', path: '/categories' },
    { id: 'users', label: 'Users', path: '/users' },
  ];

  return (
    <aside className="bg-gray-100 min-h-screen">
      <nav className="mt-5">
        {menuItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            className="w-full justify-start"
          >
            {item.label}
          </Button>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
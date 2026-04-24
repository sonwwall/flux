import React from 'react';
import { Outlet } from 'react-router-dom';

const Content = () => {
  return (
    <main className="flex-1 p-6">
      <div className="max-w-7xl mx-auto">
        <Outlet />
      </div>
    </main>
  );
};

export default Content;
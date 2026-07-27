import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export const Dashboard: React.FC = () => {
  const { userProfile, logout } = useAuth();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold dark:text-white">Dashboard</h1>
      <p className="mt-4 dark:text-gray-300">Welcome, {userProfile?.name || 'User'} ({userProfile?.role})</p>
      
      <button 
        onClick={() => logout()}
        className="mt-6 px-4 py-2 bg-danger text-white rounded-lg hover:bg-red-700 transition"
      >
        Logout
      </button>
    </div>
  );
};

export default Dashboard;

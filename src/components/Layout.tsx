import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Users, FileSpreadsheet, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    {
      path: '/dashboard',
      name: 'Lists',
      icon: FileSpreadsheet
    },
    {
      path: '/agents',
      name: 'Agents',
      icon: Users
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <nav className="bg-white shadow-md border-b border-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center">
                  <LayoutDashboard className="h-6 w-6 text-white" />
                </div>
                <h1 className="ml-3 text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
              </div>
              <div className="hidden sm:ml-8 sm:flex sm:space-x-2">
                {navItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`px-4 py-2 rounded-md inline-flex items-center transition-all duration-200 ${
                      isActive(item.path)
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className={`mr-2 h-5 w-5 ${
                      isActive(item.path) ? 'text-indigo-500' : 'text-gray-400'
                    }`} />
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center text-sm text-gray-600">
                <span className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                  <span className="text-white font-medium">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </span>
                <span className="ml-2">{user?.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-gray-700 
                hover:bg-gray-50 focus:outline-none transition-colors duration-200"
              >
                <LogOut className="mr-2 h-5 w-5 text-gray-500" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
          {children}
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Admin Dashboard. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
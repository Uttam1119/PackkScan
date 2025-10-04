import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  UserCircleIcon,
  ClockIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  CameraIcon,
  HomeIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

const Navigation = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: HomeIcon },
    { path: '/scan', label: 'Scan Food', icon: CameraIcon },
    { path: '/history', label: 'History', icon: ClockIcon }
  ];

  const isActive = (path) => location.pathname === path;

  return (
  <nav className="bg-white shadow-sm sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-4">
      <div className="flex items-center justify-between h-16">
        {/* Logo and Brand */}
        <div className="flex items-center">
          <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
            <img src="/packScan.svg" alt="PackScan" className="h-8 w-8 mr-2" />
            <span className="text-xl font-semibold text-slate-800">PackScan</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex ml-10 space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
                    isActive(item.path)
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Profile Section */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center space-x-2 text-slate-700 hover:bg-slate-50 px-3 py-2 rounded-lg transition-colors"
          >
            <div className="hidden md:block text-right mr-2">
              <p className="text-sm font-medium text-slate-900">{user?.name || user?.username}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
            <UserCircleIcon className="h-8 w-8 text-slate-500" />
            <ChevronDownIcon
              className={`h-4 w-4 text-slate-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-slate-100 py-2">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-medium text-slate-900">{user?.name || user?.username}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>

              <button
                onClick={() => {
                  navigate('/history');
                  setShowDropdown(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center text-sm text-slate-700 transition-colors"
              >
                <ClockIcon className="h-4 w-4 mr-3 text-slate-400" />
                Food History
              </button>

              <button
                onClick={() => {
                  navigate('/profile');
                  setShowDropdown(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center text-sm text-slate-700 transition-colors"
              >
                <Cog6ToothIcon className="h-4 w-4 mr-3 text-slate-400" />
                Profile Settings
              </button>

              <div className="border-t border-slate-100 mt-2 pt-2">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover:bg-red-50 flex items-center text-sm text-red-600 transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden flex justify-around py-2 border-t border-slate-100">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center px-3 py-1 rounded-lg ${
                isActive(item.path) ? 'text-slate-900' : 'text-slate-500'
              }`}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  </nav>
);

};

export default Navigation;
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Monitor, 
  Film, 
  Settings, 
  LogOut,
  ChevronRight,
  Menu
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const { logout, user } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Screens', path: '/screens', icon: <Monitor size={20} /> },
    { name: 'Playlists', path: '/playlists', icon: <Film size={20} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-gray-900 bg-opacity-50 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
      
      {/* Mobile sidebar button */}
      <div className="fixed top-4 left-4 z-30 lg:hidden">
        <button
          className="p-2 rounded-md bg-white shadow-md text-gray-700 hover:bg-gray-100"
          onClick={toggleSidebar}
        >
          <Menu size={20} />
        </button>
      </div>
      
      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-gray-900 text-white z-30
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        lg:static lg:translate-x-0
      `}>
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <div className="flex items-center space-x-2">
              <Monitor className="text-blue-400" size={24} />
              <span className="text-xl font-bold">DigiSignCMS</span>
            </div>
            <button
              className="lg:hidden text-gray-400 hover:text-white"
              onClick={toggleSidebar}
            >
              <ChevronRight size={20} />
            </button>
          </div>
          
          {/* User info */}
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="font-medium">{user?.name.charAt(0)}</span>
              </div>
              <div>
                <p className="font-medium">{user?.name}</p>
                <p className="text-sm text-gray-400">{user?.email}</p>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 py-4 overflow-y-auto">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => `
                      flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800
                      ${isActive ? 'bg-gray-800 text-white border-l-4 border-blue-500' : ''}
                    `}
                  >
                    <span className="mr-3">{item.icon}</span>
                    <span>{item.name}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          
          {/* Logout */}
          <div className="p-4 border-t border-gray-800">
            <Button
              variant="ghost"
              fullWidth
              icon={<LogOut size={18} />}
              onClick={logout}
              className="justify-start text-gray-300 hover:text-white hover:bg-gray-800"
            >
              Logout
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
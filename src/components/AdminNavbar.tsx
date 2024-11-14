import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import UserManagement from './UserManagement';
import { ThemeToggle } from './ui/theme-toggle';

interface AdminNavbarProps {
  userEmail?: string;
  userRole?: string;
}

export default function AdminNavbar({ userEmail, userRole }: AdminNavbarProps) {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const formatRole = (role: string = '') => {
    return role
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const isGlobalAdmin = userRole === 'global_admin';

  return (
    <>
      <nav className="bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-semibold text-foreground">
                Event Management
              </h1>
            </div>

            <div className="relative flex items-center gap-2">
              <ThemeToggle />
              
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 p-2 rounded-full hover:bg-accent transition-colors"
              >
                <User className="w-6 h-6 text-foreground" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-background rounded-md shadow-lg py-1 z-10 border">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-medium text-foreground truncate">
                      {userEmail}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatRole(userRole)}
                    </p>
                  </div>
                  
                  {isGlobalAdmin && (
                    <button
                      onClick={() => {
                        setShowUserManagement(true);
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center px-4 py-2 text-sm text-foreground hover:bg-accent"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      User Management
                    </button>
                  )}

                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center px-4 py-2 text-sm text-foreground hover:bg-accent"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <UserManagement 
        open={showUserManagement} 
        onOpenChange={setShowUserManagement}
      />
    </>
  );
}
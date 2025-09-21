import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, LogOut, Settings, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { auth } from '@/lib/auth';
import { LoginModal } from '@/components/auth/LoginModal';

export const Header = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const isAuthenticated = auth.isAuthenticated();
  const user = auth.getUser();

  const handleLogout = () => {
    auth.logout();
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
              <Home className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold text-primary">FlatFit</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/flats" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth">
              Find Flats
            </Link>
            <Link to="/list-new-flat" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth">
              List a Flat
            </Link>
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link to="/me" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/my-flats" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      My Flats
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="primary" onClick={() => setShowLoginModal(true)}>
                Login
              </Button>
            )}
          </div>
        </div>
      </header>

      <LoginModal 
        open={showLoginModal} 
        onOpenChange={setShowLoginModal}
      />
    </>
  );
};
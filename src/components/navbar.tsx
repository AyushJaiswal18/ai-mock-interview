"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { APP_CONFIG, NAV_CONFIG, ROLES } from "@/lib/constants";
import { useAuth } from "@/contexts/auth-context";
import { Brain, Menu, X, LogOut, User } from "lucide-react";
import { useState } from "react";

// Helper functions for role-based navigation
function getRoleBasedDashboard(role?: string): string {
  switch (role) {
    case ROLES.ADMIN:
      return '/admin/dashboard';
    case ROLES.RECRUITER:
      return '/recruiter/dashboard';
    case ROLES.CANDIDATE:
      return '/candidate/dashboard';
    default:
      return '/dashboard';
  }
}

function getRoleBasedDashboardLabel(role?: string): string {
  switch (role) {
    case ROLES.ADMIN:
      return 'Admin Dashboard';
    case ROLES.RECRUITER:
      return 'Recruiter Dashboard';
    case ROLES.CANDIDATE:
      return 'My Dashboard';
    default:
      return 'Dashboard';
  }
}

interface NavbarProps {
  className?: string;
}

export function Navbar({ className = "" }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className={`border-b border-white/10 bg-black/80 backdrop-blur-sm sticky top-0 z-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Link href={NAV_CONFIG.home.path} className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                {APP_CONFIG.name}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href={NAV_CONFIG.home.path}
              className="text-gray-300 hover:text-white transition-colors font-medium"
            >
              Home
            </Link>
            <Link
              href="/pricing"
              className="text-gray-300 hover:text-white transition-colors font-medium"
            >
              Pricing
            </Link>
            <Link
              href="/about"
              className="text-gray-300 hover:text-white transition-colors font-medium"
            >
              About
            </Link>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm text-gray-300">
                    {user?.firstName || user?.email}
                  </span>
                </div>
                <Button variant="outline" size="sm" className="text-white" asChild>
                  <Link href={getRoleBasedDashboard(user?.role)}>
                    {getRoleBasedDashboardLabel(user?.role)}
                  </Link>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={logout}
                  className="text-white hover:text-red-400"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" className="text-white" asChild>
                  <Link href="/login">
                    Sign In
                  </Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register">
                    Sign Up
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="text-white hover:bg-white/10"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 py-4">
            <nav className="flex flex-col space-y-4">
              <Link 
                href={NAV_CONFIG.home.path}
                className="text-gray-300 hover:text-white transition-colors font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/pricing"
                className="text-gray-300 hover:text-white transition-colors font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link 
                href="/about"
                className="text-gray-300 hover:text-white transition-colors font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
              
              {/* Mobile Auth Buttons */}
              <div className="pt-4 border-t border-white/10">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-gray-300 text-sm">Signed in as {user?.firstName || user?.email}</span>
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full text-white" asChild>
                      <Link href={getRoleBasedDashboard(user?.role)}>
                        {getRoleBasedDashboardLabel(user?.role)}
                      </Link>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={logout}
                      className="w-full text-white hover:text-red-400"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <Button variant="ghost" size="sm" className="w-full text-white" asChild>
                      <Link href="/login">
                        Sign In
                      </Link>
                    </Button>
                    <Button size="sm" className="w-full" asChild>
                      <Link href="/register">
                        Sign Up
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { APP_CONFIG, NAV_CONFIG } from "@/lib/constants";
import { Brain, Menu, X } from "lucide-react";
import { useState } from "react";

interface NavbarProps {
  className?: string;
}

export function Navbar({ className = "" }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
            <SignedIn>
              <UserButton afterSignOutUrl={NAV_CONFIG.home.path} />
              <Button variant="outline" size="sm" className="text-white" asChild>
                <Link href={NAV_CONFIG.dashboard.path}>
                  {NAV_CONFIG.dashboard.label}
                </Link>
              </Button>
            </SignedIn>
            <SignedOut>
              <Button variant="ghost" size="sm" className="text-white" asChild>
                <Link href={NAV_CONFIG.signIn.path}>
                  {NAV_CONFIG.signIn.label}
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link href={NAV_CONFIG.signUp.path}>
                  {NAV_CONFIG.signUp.label}
                </Link>
              </Button>
            </SignedOut>
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
                <SignedIn>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-300 text-sm">Signed in</span>
                    <UserButton afterSignOutUrl={NAV_CONFIG.home.path} />
                  </div>
                  <Button variant="outline" size="sm" className="w-full text-white" asChild>
                    <Link href={NAV_CONFIG.dashboard.path}>
                      {NAV_CONFIG.dashboard.label}
                    </Link>
                  </Button>
                </SignedIn>
                <SignedOut>
                  <div className="flex flex-col space-y-2">
                    <Button variant="ghost" size="sm" className="w-full text-white" asChild>
                      <Link href={NAV_CONFIG.signIn.path}>
                        {NAV_CONFIG.signIn.label}
                      </Link>
                    </Button>
                    <Button size="sm" className="w-full" asChild>
                      <Link href={NAV_CONFIG.signUp.path}>
                        {NAV_CONFIG.signUp.label}
                      </Link>
                    </Button>
                  </div>
                </SignedOut>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

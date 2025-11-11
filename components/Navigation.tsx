'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageCircle, LayoutDashboard, Bot } from 'lucide-react';

export function Navigation() {
  const pathname = usePathname();

  const links = [
    {
      href: '/chat',
      label: 'Chat Support',
      icon: <MessageCircle className="h-5 w-5" />,
      active: pathname === '/chat'
    },
    {
      href: '/dashboard',
      label: 'Agent Dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      active: pathname === '/dashboard'
    }
  ];

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Bot className="h-8 w-8 text-blue-500" />
            <span className="text-xl font-bold text-gray-900">Ticket AI</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-8">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  link.active
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Mobile menu button (simplified) */}
          <div className="md:hidden">
            <Link
              href="/chat"
              className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700"
            >
              <MessageCircle className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile menu (simplified) */}
      <div className="md:hidden border-t">
        <div className="px-2 pt-2 pb-3 space-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
                link.active
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
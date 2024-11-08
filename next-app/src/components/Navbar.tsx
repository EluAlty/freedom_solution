import React from 'react'
import Link from 'next/link'

export const Navbar: React.FC = () => (
  <nav className="bg-white shadow-md">
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center py-4">
        <Link href="/" className="text-2xl font-bold text-blue-600 hover:text-blue-800 transition-colors duration-200">
          JustFind
        </Link>
        
        <div className="hidden md:flex space-x-6">
          <NavLink href="/">Главная</NavLink>
          <NavLink href="/database">База данных</NavLink>
          <NavLink href="/history">История вакансий</NavLink>
        </div>

        <button 
          className="md:hidden focus:outline-none"
          aria-label="Toggle menu"
        >
          <svg className="h-6 w-6 fill-current text-blue-600" viewBox="0 0 24 24">
            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  </nav>
)

const NavLink: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
  <Link href={href} className="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200">
    {children}
  </Link>
)
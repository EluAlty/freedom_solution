import React, { useState } from 'react'
import Link from 'next/link'

export const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-2xl font-bold text-blue-600 hover:text-blue-800 transition-colors duration-200">
            JustFind
          </Link>
          
          <div className={`absolute top-16 left-0 right-0 bg-white md:relative md:top-0 md:flex space-y-4 md:space-y-0 md:space-x-6 p-4 md:p-0 shadow-lg md:shadow-none transition-all duration-300 ${isMenuOpen ? 'block' : 'hidden'} md:block`}>
            <NavLink href="/">Главная</NavLink>
            <NavLink href="/database">База данных</NavLink>
          </div>

          <button 
            className="md:hidden focus:outline-none"
            aria-label="Toggle menu"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="h-6 w-6 fill-current text-blue-600" viewBox="0 0 24 24">
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  )
}

const NavLink: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
  <Link href={href} className="block text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200">
    {children}
  </Link>
)
'use client'
import React from 'react'
import { signOut } from 'firebase/auth'
import { auth } from '@/src/context/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuthContext } from '@/src/context/AuthContext'

const Navigation = () => {
  const router = useRouter()
  const pathname = usePathname()
  const { isAdmin } = useAuthContext()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        router.replace('/Login')
      })
      .catch((error) => {
        console.error('Sign out error:', error)
      })
  }

  const navLinks = isAdmin 
    ? [
        { name: 'Dashboard', href: '/AdminDashBoard' },
        { name: 'Course Management', href: '/CourseManagement' },
      ]
    : [
        { name: 'Dashboard', href: '/UserDashBoard' },
        { name: 'Add Course', href: '/UserDashBoard/AddCourses' },
        { name: 'Set Alert', href: '/UserDashBoard/SetAlerts' },
      ]

  return (
    <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-[#E2E2E4] shadow-sm">
      <div className="flex justify-between items-center w-full px-4 md:px-margin-desktop max-w-container-max mx-auto h-[68px]">
        <div className="flex items-center gap-4">
          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-on-surface"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span className="material-symbols-outlined">{isMobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
          
          <div className="text-headline-md font-headline-md font-bold tracking-tight text-on-surface">
            Academic Portal
          </div>
        </div>
        
        {/* Desktop Nav with links flush with bottom boundary */}
        <nav className="hidden md:flex items-stretch space-x-8 h-full">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.name}
                href={link.href}
                className={`flex items-center border-b-[3px] px-1 transition-all text-body-md font-body-md mt-[3px] ${
                  isActive 
                    ? 'border-primary text-primary font-bold' 
                    : 'border-transparent text-soft-gray hover:text-on-surface hover:border-soft-gray/20'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center space-x-4">
          <button 
            onClick={handleSignOut}
            className="bg-primary text-on-primary px-6 py-2 rounded-full font-label-md text-label-md hover:opacity-90 transition-all active:scale-95 hidden sm:block"
          >
            Sign Out
          </button>
          {/* Mobile Sign Out Icon */}
          <button 
            onClick={handleSignOut}
            className="sm:hidden text-primary p-2"
          >
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </div>


      {/* Mobile Nav Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-b border-outline-variant/30 px-4 py-6 space-y-4 animate-in slide-in-from-top duration-300">
          {navLinks.map((link) => (
            <Link 
              key={link.name}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`${
                pathname === link.href 
                  ? 'text-primary bg-primary/5 font-bold' 
                  : 'text-soft-gray'
              } block px-4 py-3 rounded-xl text-body-lg transition-all`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}

export default Navigation

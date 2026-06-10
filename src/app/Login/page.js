'use client'
import '../globals.css'
import {useEffect, useState} from 'react'
import signIn from '@/src/firebase/signin'
import { useRouter } from 'next/navigation'
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { useAuthContext } from '@/src/context/AuthContext'
import Link from 'next/link'

const Login = () => {
  const [uname, setuname] = useState('')
  const [pass, setpass] = useState('')
  const [roleTab, setRoleTab] = useState('student')
  const router = useRouter()
  const { user, loading: authLoading } = useAuthContext()

  useEffect(() => {
    if (authLoading) return

    if (user != null) {
      user.getIdTokenResult().then((idTokenResult) => {
        if (idTokenResult.claims.admin || user.email === 'admin@demo.com') {
          router.replace('/AdminDashBoard')
        } else {
          router.replace('/UserDashBoard')
        }
      })
    }
  }, [user, authLoading])

  const handleSignIn = async (e) => {
    e.preventDefault()
    if (uname.length > 0 && pass.length >= 8) {
      const { result, error } = await signIn(uname, pass)
      if (error) {
        alert('Invalid credentials. Please check your email and password.')
        return
      }
    } else if (pass.length < 8) {
      alert('Password must be at least 8 characters.')
    }
  }

  const handleDemoLogin = async () => {
    const demoEmail = roleTab === 'student' ? 'student@demo.com' : 'admin@demo.com'
    const demoPassword = 'password123'
    
    const { result, error } = await signIn(demoEmail, demoPassword)
    if (error) {
      // Self-healing: automatically create the demo user on Firebase if it doesn't exist
      const signUp = (await import('@/src/firebase/signup')).default
      const { result: signUpResult, error: signUpError } = await signUp(demoEmail, demoPassword)
      if (signUpError) {
        alert('Failed to initialize demo session. Please try again.')
        return
      }
      
      const { error: secondSignInError } = await signIn(demoEmail, demoPassword)
      if (secondSignInError) {
        alert('Failed to authenticate demo session.')
      }
    }
  }

  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-system-blue/5 rounded-full blur-[100px]"></div>
        <img alt="University Library" className="absolute inset-0 w-full h-full object-cover opacity-10 mix-blend-overlay" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD3lhLDPn6mQaJdp6Ftyr6twIaNChbCMqKFbwM-tkDRIe3JudaeCC3OC1B3jqXvB7bLWU3nDZMcucJM8VjXydqPzeqppUzvWWpUxVzd0BkMNbBKPHJ2SAmxSnhQUpfknMg5mk40iuRcUPrYz2Bv4qm-z01o8NUJFssS8Ie_6XQ63oWJ06sq07TlHVqVxJjdrmUoXUoNSEr0Fvb-Bg_8vwpYdqnmTGaqml1zw-EkjbZ8o2u4ia2jhdwHfyz_nqQYymqCqg3A2-Xfni5s" />
      </div>

      <main className="relative z-10 w-full max-w-[440px] px-margin-mobile md:px-0 mx-auto mt-20">
        <div className="glass-panel rounded-[32px] p-8 md:p-12 flex flex-col items-center">
          <div className="mb-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-primary p-2.5 rounded-xl shadow-sm">
                <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
              </div>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-deep-charcoal tracking-tight">Academic Portal</h1>
            <p className="font-body-md text-body-md text-soft-gray mt-2">
              {roleTab === 'student' ? 'Student Registration & Access' : 'Administration & Faculty Portal'}
            </p>
          </div>

          {/* Premium Role Selection Tabs */}
          <div className="flex bg-surface-container-low p-1 rounded-2xl border border-surface-variant/20 w-full mb-8">
            <button 
              onClick={() => setRoleTab('student')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-label-md font-bold transition-all ${roleTab === 'student' ? 'bg-white text-primary shadow-sm' : 'text-soft-gray hover:text-on-surface'}`}
            >
              <span className="material-symbols-outlined text-[20px]">school</span>
              Student
            </button>
            <button 
              onClick={() => setRoleTab('admin')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-label-md font-bold transition-all ${roleTab === 'admin' ? 'bg-white text-primary shadow-sm' : 'text-soft-gray hover:text-on-surface'}`}
            >
              <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
              Admin / Staff
            </button>
          </div>

          <form className="w-full space-y-5" onSubmit={handleSignIn}>
            <div className="space-y-1.5">
              <label className="font-label-md text-label-md text-on-surface-variant ml-1" htmlFor="email">University Email</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors text-[20px]">mail</span>
                <input 
                  className="w-full pl-12 pr-4 py-3.5 bg-surface-container-lowest border border-outline-variant/50 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-body-md text-body-md outline-none" 
                  id="email" 
                  placeholder={roleTab === 'student' ? 'student@university.edu' : 'faculty@university.edu'} 
                  type="email"
                  onChange={(e) => setuname(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="password">Password</label>
              </div>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors text-[20px]">lock</span>
                <input 
                  className="w-full pl-12 pr-4 py-3.5 bg-surface-container-lowest border border-outline-variant/50 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-body-md text-body-md outline-none" 
                  id="password" 
                  placeholder="••••••••" 
                  type="password"
                  onChange={(e) => setpass(e.target.value)}
                  required
                />
              </div>
            </div>

            <button className="w-full bg-primary text-white py-4 rounded-2xl font-headline-md text-headline-md shadow-md hover:opacity-95 active:scale-[0.98] transition-all duration-200 mt-4" type="submit">
              Sign In
            </button>

            {/* Premium Demo Access Switch */}
            <button 
              type="button"
              onClick={handleDemoLogin}
              className="w-full py-4 border border-primary/20 rounded-2xl font-headline-md text-headline-md text-primary flex items-center justify-center space-x-2 bg-primary/5 hover:bg-primary/10 transition-all duration-200 mt-3 shadow-sm hover:shadow active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 0" }}>account_circle</span>
              <span>Login as Demo {roleTab === 'student' ? 'Student' : 'Admin'}</span>
            </button>
          </form>

          <div className="mt-10 flex flex-col items-center space-y-6 w-full">
            <div className="relative w-full flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant/30"></div>
              </div>
              <span className="relative px-4 bg-transparent font-label-md text-label-md text-soft-gray">New to the portal?</span>
            </div>
            
            <button 
              className="w-full py-4 border border-outline-variant/50 rounded-2xl font-headline-md text-headline-md text-primary flex items-center justify-center space-x-2 bg-surface-container-lowest/50 hover:bg-surface-container-lowest transition-colors"
              onClick={(e) => {
                e.preventDefault()
                router.replace('/SignUp')
              }}
            >
              <span>Create Account</span>
            </button>
          </div>
        </div>
      </main>
    </>
  )
}

export default Login

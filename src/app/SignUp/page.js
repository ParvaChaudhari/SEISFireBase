'use client'
import '../globals.css'
import signUp from '@/src/firebase/signup'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/src/context/AuthContext'
import Link from 'next/link'

const SignUpPage = () => {
  const [uname, setuname] = useState('')
  const [pass, setpass] = useState('')
  const [cpass, setcpass] = useState('')
  const router = useRouter()
  const { user } = useAuthContext()

  useEffect(() => {
    if (user != null) {
      user.getIdTokenResult().then((idTokenResult) => {
        if (idTokenResult.claims.admin) {
          router.replace('/AdminDashBoard')
        } else {
          router.replace('/UserDashBoard')
        }
      })
    }
  }, [user])

  const handleSignUp = async (e) => {
    e.preventDefault()
    if (pass !== cpass) {
      alert('Passwords do not match')
      return
    }
    if (uname.length > 0 && pass.length >= 8) {
      const { result, error } = await signUp(uname, pass)
      if (error) {
        alert(error.message)
        return
      }
      return router.replace('/UserDashBoard')
    }
  }

  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-system-blue/5 rounded-full blur-[100px]"></div>
        <img alt="University Library" className="absolute inset-0 w-full h-full object-cover opacity-10 mix-blend-overlay" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD3lhLDPn6mQaJdp6Ftyr6twIaNChbCMqKFbwM-tkDRIe3JudaeCC3OC1B3jqXvB7bLWU3nDZMcucJM8VjXydqPzeqppUzvWWpUxVzd0BkMNbBKPHJ2SAmxSnhQUpfknMg5mk40iuRcUPrYz2Bv4qm-z01o8NUJFssS8Ie_6XQ63oWJ06sq07TlHVqVxJjdrmUoXUoNSEr0Fvb-Bg_8vwpYdqnmTGaqml1zw-EkjbZ8o2u4ia2jhdwHfyz_nqQYymqCqg3A2-Xfni5s" />
      </div>

      <main className="relative z-10 w-full max-w-[440px] px-margin-mobile md:px-0 mx-auto mt-20 mb-20">
        <div className="glass-panel rounded-[32px] p-8 md:p-12 flex flex-col items-center">
          <div className="mb-10 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-primary p-2.5 rounded-xl shadow-sm">
                <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>person_add</span>
              </div>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-deep-charcoal tracking-tight">Create Account</h1>
            <p className="font-body-md text-body-md text-soft-gray mt-2">Join the academic portal</p>
          </div>

          <form className="w-full space-y-5" onSubmit={handleSignUp}>
            <div className="space-y-1.5">
              <label className="font-label-md text-label-md text-on-surface-variant ml-1" htmlFor="email">University Email</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors text-[20px]">mail</span>
                <input 
                  className="w-full pl-12 pr-4 py-3.5 bg-surface-container-lowest border border-outline-variant/50 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-body-md text-body-md outline-none" 
                  id="email" 
                  placeholder="name@university.edu" 
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
                  minLength={8}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="cpassword">Confirm Password</label>
              </div>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors text-[20px]">lock_reset</span>
                <input 
                  className="w-full pl-12 pr-4 py-3.5 bg-surface-container-lowest border border-outline-variant/50 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-body-md text-body-md outline-none" 
                  id="cpassword" 
                  placeholder="••••••••" 
                  type="password"
                  onChange={(e) => setcpass(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
            </div>

            <button className="w-full bg-primary-container text-white py-4 rounded-2xl font-headline-md text-headline-md shadow-md hover:bg-primary-container/90 active:scale-[0.98] transition-all duration-200 mt-4" type="submit">
              Sign Up
            </button>
          </form>

          <div className="mt-10 flex flex-col items-center space-y-6 w-full">
            <div className="relative w-full flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant/30"></div>
              </div>
              <span className="relative px-4 bg-transparent font-label-md text-label-md text-soft-gray">Already have an account?</span>
            </div>
            
            <button 
              className="w-full py-4 border border-outline-variant/50 rounded-2xl font-headline-md text-headline-md text-primary flex items-center justify-center space-x-2 bg-surface-container-lowest/50 hover:bg-surface-container-lowest transition-colors"
              onClick={(e) => {
                e.preventDefault()
                router.replace('/Login')
              }}
            >
              <span>Sign In Instead</span>
            </button>
          </div>
        </div>
      </main>
    </>
  )
}

export default SignUpPage

'use client'
import Link from 'next/link'
import { useAuthContext } from '@/src/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import './globals.css'

const RootPage = () => {
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
    } else {
      router.replace('/Login')
    }
  }, [user, authLoading])

  // Show nothing while redirect happens
  return null
}

export default RootPage

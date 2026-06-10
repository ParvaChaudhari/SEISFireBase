'use client'
import { useState, useRef, useEffect } from 'react'
import '../globals.css'
import Navigation from '@/src/components/Navigation'
import { useAuthContext } from '@/src/context/AuthContext'
import { useRouter } from 'next/navigation'
import getdocsbyuidseis from '@/src/firebase/firestore/getdocs'
import getdocsbyuidalerts from '@/src/firebase/firestore/getdocsalerts'
import delData from '@/src/firebase/firestore/deldata'
import delDataalerts from '@/src/firebase/firestore/deldataalerts'

const UserDashBoard = () => {
  const router = useRouter()
  const { user, isAdmin, loading: authLoading } = useAuthContext()
  const [courses, setCourses] = useState([])
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    if (authLoading) return

    if (user === null) {
      router.replace('/Login')
      return
    }

    if (isAdmin) {
      router.replace('/AdminDashBoard')
    } else {
      fetchData()
    }
  }, [user, isAdmin, authLoading, router])

  const fetchData = async () => {
    if (!user || !user.uid) return;
    
    setLoading(true)
    try {
      const courseRes = await getdocsbyuidseis(user.uid)
      if (courseRes?.send) setCourses(courseRes.send)
      
      const alertRes = await getdocsbyuidalerts(user.uid)
      if (alertRes?.send) setAlerts(alertRes.send)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Optimistic delete: remove from UI instantly, no refetch needed
  const handleDeleteCourse = async (id) => {
    setCourses(prev => prev.filter(c => c !== id))
    const { error } = await delData(user.uid, id)
    if (error) {
      // Revert on failure
      fetchData()
      alert('Failed to remove course. Please try again.')
    }
  }

  const handleDeleteAlert = async (id) => {
    setAlerts(prev => prev.filter(a => a !== id))
    const { error } = await delDataalerts(user.uid, id)
    if (error) {
      fetchData()
      alert('Failed to remove alert. Please try again.')
    }
  }

  return (
    <div className="bg-background-off-white min-h-screen">
      <Navigation />
      
      <main className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-12">
        {/* Hero Section */}
        <section className="mb-12">
          <div className="max-w-2xl">
            <span className="text-primary font-label-md text-label-md uppercase tracking-widest mb-4 block">Spring Semester 2024</span>
            <h1 className="font-display-lg text-display-lg text-deep-charcoal mb-4">Welcome back, {user?.email?.split('@')[0] || 'Student'}.</h1>
            <p className="text-body-lg font-body-lg text-soft-gray max-w-lg">Here is your academic overview for the upcoming semester.</p>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          {/* Main Content: Current Courses */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="font-headline-lg text-headline-lg text-on-surface">Enrolled Courses</h2>
            </div>

            <div className="space-y-4">
              {loading ? (
                // Skeleton loading state
                [1,2].map(i => (
                  <div key={i} className="bg-white p-5 rounded-2xl border border-outline-variant/20 animate-pulse h-16">
                    <div className="flex justify-between items-center">
                      <div className="w-32 h-4 bg-surface-container rounded"></div>
                      <div className="w-6 h-6 rounded bg-surface-container"></div>
                    </div>
                  </div>
                ))
              ) : (
                <>
                  {courses.length === 0 && (
                    <div className="bg-white p-8 rounded-2xl border border-outline-variant/20 text-center text-soft-gray font-body-md">
                      No courses enrolled yet. Head to "Add Course" to get started.
                    </div>
                  )}
                  
                  {courses.map((courseId) => (
                    <div key={courseId} className="bg-white p-5 rounded-2xl border border-outline-variant/20 flex gap-4 items-center shadow-sm hover:shadow-md transition-shadow group">
                      <div className="shrink-0 w-10 h-10 rounded-full bg-primary-container/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary">school</span>
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-headline-md text-headline-md text-deep-charcoal">{courseId}</h3>
                        <p className="text-soft-gray text-body-sm">Spring 2024</p>
                      </div>
                      <button 
                        onClick={() => handleDeleteCourse(courseId)}
                        className="text-error/50 hover:text-error transition-colors p-2 opacity-0 group-hover:opacity-100"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Sidebar: Alerts */}
          <aside className="lg:col-span-4 space-y-8">
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Active Alerts</h2>
            <div className="space-y-4">
              {alerts.length === 0 && !loading && (
                <div className="text-soft-gray font-body-md italic p-4">
                  No active alerts.
                </div>
              )}
              
              {alerts.map((alertId) => (
                <div key={alertId} className="bg-white p-5 rounded-2xl border border-outline-variant/20 flex gap-4 items-center shadow-sm">
                  <div className="shrink-0 w-10 h-10 rounded-full bg-primary-container/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">notifications_active</span>
                  </div>
                  <div className="flex-grow">
                    <p className="font-label-md text-label-md text-on-surface">{alertId}</p>
                    <p className="text-body-md text-on-surface-variant text-[14px]">Notification active</p>
                  </div>
                  <button 
                    onClick={() => handleDeleteAlert(alertId)}
                    className="text-error/40 hover:text-error transition-colors"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
              ))}
            </div>

           
          </aside>
        </div>
      </main>
    </div>
  )
}

export default UserDashBoard


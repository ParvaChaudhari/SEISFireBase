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
  const { user, isAdmin } = useAuthContext()
  const [courses, setCourses] = useState([])
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [changed, setChanged] = useState(false)
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (user === null) {
      if (!isFirstRender.current) {
        router.replace('/Login')
      }
    } else if (isAdmin) {
      router.replace('/AdminDashBoard')
    } else {
      fetchData()
    }
    isFirstRender.current = false
  }, [user, isAdmin])

  const fetchData = async () => {
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
              {loading ? (
                // Skeleton loading state
                [1,2].map(i => (
                  <div key={i} className="glass-card ambient-shadow p-6 rounded-2xl h-[200px] animate-pulse">
                    <div className="flex justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-surface-container"></div>
                      <div className="w-6 h-6 rounded bg-surface-container"></div>
                    </div>
                    <div className="h-5 w-3/4 bg-surface-container rounded mb-2"></div>
                    <div className="h-4 w-1/2 bg-surface-container rounded"></div>
                  </div>
                ))
              ) : (
                <>
                  {courses.length === 0 && (
                    <div className="md:col-span-2 glass-card p-12 rounded-2xl text-center text-soft-gray font-body-md">
                      No courses enrolled yet. Head to "Add Course" to get started.
                    </div>
                  )}
                  
                  {courses.map((courseId) => (
                    <div key={courseId} className="glass-card ambient-shadow p-6 rounded-2xl flex flex-col justify-between h-[200px] group border border-transparent hover:border-primary/30 transition-all">
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div className="bg-primary-container/10 p-3 rounded-xl">
                            <span className="material-symbols-outlined text-primary">school</span>
                          </div>
                          <button 
                            onClick={() => handleDeleteCourse(courseId)}
                            className="text-error/50 hover:text-error transition-colors p-2"
                          >
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </div>
                        <h3 className="font-headline-md text-headline-md text-deep-charcoal">{courseId}</h3>
                        <p className="text-soft-gray text-body-md">Spring 2024</p>
                      </div>
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

            {/* Progress Card */}
            <div className="glass-card ambient-shadow p-8 rounded-2xl mt-8">
              <h3 className="font-headline-md text-headline-md text-deep-charcoal mb-6">Academic Progress</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-label-md font-label-md text-soft-gray">Degree Completion</span>
                    <span className="text-label-md font-label-md text-on-surface">65%</span>
                  </div>
                  <div className="w-full bg-surface-container rounded-full h-1.5">
                    <div className="bg-primary h-1.5 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>
                <div className="flex justify-between py-4 border-t border-outline-variant/10">
                  <span className="text-body-md text-soft-gray">Current GPA</span>
                  <span className="text-headline-md font-headline-md text-primary">3.82</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}

export default UserDashBoard


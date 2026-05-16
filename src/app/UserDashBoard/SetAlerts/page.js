'use client'
import { useState, useEffect, useRef } from 'react'
import '../../globals.css'
import Navigation from '@/src/components/Navigation'
import { useAuthContext } from '@/src/context/AuthContext'
import { useRouter } from 'next/navigation'
import addDataalerts from '@/src/firebase/firestore/adddataalerts'
import getalldocsalerts from '@/src/firebase/firestore/getalldocsalerts'

const SetAlerts = () => {
  const [selectedCourse, setSelectedCourse] = useState('')
  const [courseOptions, setCourseOptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const { user } = useAuthContext()
  const router = useRouter()
  const count = useRef(0)

  useEffect(() => {
    if (user != null) {
      user.getIdTokenResult().then((idTokenResult) => {
        if (idTokenResult.claims.admin) {
          router.replace('/AdminDashBoard')
        } else {
          fetchAlertOptions()
        }
      })
    } else {
      router.replace('/Login')
    }
  }, [user])

  const fetchAlertOptions = async () => {
    setLoading(true)
    try {
      const result = await getalldocsalerts(user.uid)
      if (result) {
        count.current = result.send.pop()
        setCourseOptions(result.send)
        if (result.send.length > 0) setSelectedCourse(result.send[0])
      }
    } catch (error) {
      console.error("Error fetching alert options:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleActivateAlert = async (e) => {
    e.preventDefault()
    if (!selectedCourse) return

    if (count.current >= 3) {
      alert('MAX ALERTS REACHED (3 alerts limit)')
      return
    }

    setSubmitting(true)
    try {
      const { result, error } = await addDataalerts(user.uid, selectedCourse)
      if (result) {
        alert(`Alert activated for ${selectedCourse}`)
        router.replace('/UserDashBoard')
      } else {
        alert(error?.message || "Failed to set alert")
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-background-off-white min-h-screen">
      <Navigation />
      
      <main className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-12">
        <header className="mb-12">
          <h1 className="text-display-lg font-display-lg text-deep-charcoal mb-4">Notification Center</h1>
          <p className="text-body-lg font-body-lg text-soft-gray max-w-2xl">
            Configure custom alerts for course availability. 
            <span className="block mt-2 font-bold text-primary">Limit: 3 active alerts.</span>
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          <section className="lg:col-span-7">
            <div className="bg-white rounded-xl p-8 md:p-10 shadow-sm border border-surface-container">
              <h2 className="text-headline-lg font-headline-lg text-on-surface mb-8">Create New Alert</h2>
              <form className="space-y-8" onSubmit={handleActivateAlert}>
                <div className="space-y-2">
                  <label className="text-label-md font-label-md text-on-surface-variant block ml-1">Select Course</label>
                  <div className="relative">
                    <select 
                      className="w-full bg-background-off-white border-[#D2D2D7] rounded-xl px-4 py-4 text-body-md font-body-md appearance-none focus:ring-primary focus:border-primary outline-none"
                      value={selectedCourse}
                      onChange={(e) => setSelectedCourse(e.target.value)}
                      disabled={loading}
                    >
                      {courseOptions.length === 0 && !loading && <option disabled>No courses available for alerts</option>}
                      {courseOptions.map(courseId => (
                        <option key={courseId} value={courseId}>{courseId}</option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-soft-gray pointer-events-none">expand_more</span>
                  </div>
                </div>

                <div className="p-6 bg-background-off-white rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block text-body-md font-bold">Smart Notifications</span>
                      <span className="block text-caption font-caption text-soft-gray">Notify immediately when status changes</span>
                    </div>
                    <div className="w-12 h-6 bg-primary rounded-full relative">
                      <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></span>
                    </div>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={submitting || !selectedCourse || count.current >= 3}
                  className="w-full bg-primary text-on-primary py-4 rounded-xl font-bold text-body-md hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Activating...' : count.current >= 3 ? 'Alert Limit Reached' : 'Activate Alert'}
                </button>
              </form>
            </div>
          </section>

          <aside className="lg:col-span-5">
            <div className="relative overflow-hidden rounded-xl h-full min-h-[300px] group">
              <img className="absolute inset-0 w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBHzbTDy9D4S_kB_2OQmJaqfdojx3kl5oOLh3NMIKOzZtwQJirgZu2HeEU5sL3wcGvGz_Q4gNmegCkO5vyrpq5K2nWAP2jNZy6pbajXUQanXa9Gy2xPS-iqBnX64X5s1O5UR22bICPhn6apTHdwhly4RTm-Y1hIwVL5ogwBwKpr9hwdir37Hf8aWcAEnlSfrOD1w_ir_cG4wllUXWuTBexEjYwUqZ8YrJHIB4yutie1PkXb3lXNUGplv6XAGXgwC6lh6Q-tut7IBWFY" />
              <div className="absolute inset-0 bg-gradient-to-t from-deep-charcoal/80 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-8">
                <h4 className="text-headline-md font-bold text-white mb-2">Priority Registration</h4>
                <p className="text-label-md text-white/80">Students with active alerts register 15% faster on average.</p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}

export default SetAlerts


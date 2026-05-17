'use client'
import { useState, useEffect, useRef } from 'react'
import '../../globals.css'
import Navigation from '@/src/components/Navigation'
import { useAuthContext } from '@/src/context/AuthContext'
import { useRouter } from 'next/navigation'
import getalldocs from '@/src/firebase/firestore/getalldocs'
import addDataseis from '@/src/firebase/firestore/adddata'

const AddCourses = () => {
  const [courseList, setCourseList] = useState([])
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(null)
  const { user, isAdmin } = useAuthContext()
  const router = useRouter()
  const count = useRef(0)

  useEffect(() => {
    if (user === null) {
      router.replace('/Login')
    } else if (isAdmin) {
      router.replace('/AdminDashBoard')
    } else {
      fetchCourses()
    }
  }, [user, isAdmin])

  const fetchCourses = async () => {
    setLoading(true)
    try {
      const result = await getalldocs(user.uid)
      if (result) {
        count.current = result.send.pop()
        setCourseList(result.send)
      }
    } catch (error) {
      console.error("Error fetching courses:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEnroll = async (courseId) => {
    if (count.current >= 3) {
      alert('MAX REGISTRATION REACHED (3 courses limit)')
      return
    }

    setEnrolling(courseId)
    try {
      const { result, error } = await addDataseis(user.uid, courseId)
      if (result) {
        alert(`Successfully enrolled in ${courseId}`)
        router.replace('/UserDashBoard')
      } else {
        alert(error?.message || "Enrollment failed")
      }
    } catch (err) {
      console.error(err)
    } finally {
      setEnrolling(null)
    }
  }

  return (
    <div className="bg-background-off-white min-h-screen">
      <Navigation />
      
      <main className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-12">
        {/* Hero Section */}
        <section className="mb-12">
          <h1 className="text-display-lg font-display-lg text-deep-charcoal mb-4">Find your next challenge.</h1>
          <p className="text-body-lg font-body-lg text-soft-gray max-w-2xl">
            Browse the 2024 academic catalog and build your ideal semester schedule. 
            <span className="block mt-2 font-bold text-primary">Limit: 3 courses per semester.</span>
          </p>
        </section>

        {/* Course Catalog Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {loading ? (
             <div className="col-span-full text-center py-20 text-soft-gray">Loading courses...</div>
          ) : (
            courseList.map((courseId) => (
              <div key={courseId} className="bg-white rounded-[24px] overflow-hidden border border-outline-variant/30 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group">
                <div className="h-40 bg-surface-container-low relative overflow-hidden flex items-center justify-center">
                  <span className="material-symbols-outlined text-outline-variant text-[64px]">school</span>
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-caption font-label-md text-primary tracking-wider">OPEN</span>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-caption font-label-md text-soft-gray uppercase tracking-wider">ID: {courseId}</span>
                  </div>
                  <h3 className="text-headline-md font-headline-md text-deep-charcoal mb-3">{courseId}</h3>
                  <p className="text-body-md font-body-md text-soft-gray mb-6 line-clamp-2">
                    Advanced study of the principles and practices in {courseId}.
                  </p>
                  <div className="mt-auto">
                    <button 
                      disabled={enrolling === courseId || count.current >= 3}
                      onClick={() => handleEnroll(courseId)}
                      className="w-full bg-primary text-white py-3 rounded-xl font-label-md hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {enrolling === courseId ? 'Enrolling...' : count.current >= 3 ? 'Limit Reached' : 'Quick Enroll'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  )
}

export default AddCourses


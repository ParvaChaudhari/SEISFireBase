'use client'
import { useState, useEffect } from 'react'
import '../globals.css'
import Navigation from '@/src/components/Navigation'
import { useAuthContext } from '@/src/context/AuthContext'
import { useRouter } from 'next/navigation'
import getAllCourseIds from '@/src/firebase/firestore/getAllCourseIds'
import createNewCourse from '@/src/firebase/firestore/createNewCourse'

const CourseManagement = () => {
  const { user, isAdmin, loading: authLoading } = useAuthContext()
  const router = useRouter()
  
  const [newCourseId, setNewCourseId] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [courses, setCourses] = useState([])

  useEffect(() => {
    if (authLoading) return

    if (user === null) {
      router.replace('/Login')
      return
    }

    if (isAdmin) {
      fetchCourses()
    } else {
      router.replace('/UserDashBoard')
    }
  }, [user, isAdmin, authLoading])

  const fetchCourses = async () => {
    setLoading(true)
    try {
      const result = await getAllCourseIds()
      if (result?.send) {
        setCourses(result.send)
      }
    } catch (error) {
      console.error("Error fetching courses:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddCourse = async (e) => {
    e.preventDefault()
    if (!newCourseId) return
    
    setSubmitting(true)
    const { result, error } = await createNewCourse(newCourseId.toUpperCase().trim())
    if (result) {
      alert(`Course ${newCourseId} created successfully!`)
      setNewCourseId('')
      fetchCourses()
    } else {
      alert(error?.message || "Failed to create course")
    }
    setSubmitting(false)
  }

  return (
    <div className="bg-background-off-white min-h-screen">
      <Navigation />
      
      <main className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-12">
        <div className="mb-12">
          <h1 className="text-headline-lg font-headline-lg text-on-surface mb-2">Course Management</h1>
          <p className="text-body-md font-body-md text-soft-gray">Manage your academic offerings. Add or remove courses from the catalog.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          <div className="lg:col-span-4 space-y-gutter">
            <div className="glass-card ambient-shadow rounded-xl p-8 border border-surface-variant bg-white">
              <h3 className="text-headline-md font-headline-md text-on-surface mb-6">Create Course</h3>
              <form onSubmit={handleAddCourse} className="space-y-4">
                <div>
                  <label className="text-label-md font-label-md text-soft-gray block mb-2">New Course ID</label>
                  <input 
                    type="text"
                    placeholder="e.g. CS50"
                    className="w-full bg-background-off-white border-[#D2D2D7] rounded-xl px-4 py-3 text-body-md focus:ring-primary focus:border-primary outline-none"
                    value={newCourseId}
                    onChange={(e) => setNewCourseId(e.target.value)}
                  />
                </div>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Add Course'}
                </button>
              </form>
            </div>
          </div>
          
          <div className="lg:col-span-8 space-y-gutter">
            <div className="glass-card ambient-shadow rounded-xl p-8 border border-surface-variant bg-white">
              <h3 className="text-headline-md font-headline-md text-on-surface mb-6">Active Courses</h3>
              {loading ? (
                <div className="text-soft-gray">Loading courses...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {courses.length === 0 && <p className="text-caption text-soft-gray">No courses active yet.</p>}
                  {courses.map(courseId => (
                    <div key={courseId} className="p-4 border border-surface-variant rounded-xl flex justify-between items-center bg-surface-container-low/30">
                      <span className="font-headline-md text-on-surface">{courseId}</span>
                      <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-caption font-bold tracking-wider">ACTIVE</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default CourseManagement

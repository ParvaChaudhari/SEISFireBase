'use client'
import { useState, useEffect } from 'react'
import '../globals.css'
import Navigation from '@/src/components/Navigation'
import { useAuthContext } from '@/src/context/AuthContext'
import { useRouter } from 'next/navigation'
import LineGraph from './LineGraph'
import getsummaire from '@/src/firebase/firestore/getsummaire'
import getAllCourseIds from '@/src/firebase/firestore/getAllCourseIds'

const AdminDashBoard = () => {
  const { user } = useAuthContext()
  const router = useRouter()
  
  const [selectedCourse, setSelectedCourse] = useState('')
  const [vdata, setvdata] = useState(null)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [courseOptions, setCourseOptions] = useState([])
  
  // Dynamic KPIs for the selected course
  const [kpiData, setKpiData] = useState({
    totalEnrolled: 0,
    capacityUtil: 0,
    newRegistrations: 0,
    trend: 0
  })

  useEffect(() => {
    if (user != null) {
      user.getIdTokenResult().then((idTokenResult) => {
        if (idTokenResult.claims.admin) {
          setIsAuthorized(true)
          fetchCourses()
        } else {
          setIsAuthorized(false)
          alert('Not Authorized')
          router.replace('/UserDashBoard')
        }
      })
    } else {
      router.replace('/Login')
    }
  }, [user])

  const fetchCourses = async () => {
    setLoading(true)
    try {
      const result = await getAllCourseIds()
      if (result?.send && result.send.length > 0) {
        setCourseOptions(result.send)
        // Select the first course by default
        setSelectedCourse(result.send[0])
      }
    } catch (error) {
      console.error("Error fetching courses:", error)
    } finally {
      setLoading(false)
    }
  }

  // Update Data and KPIs when selectedCourse changes
  useEffect(() => {
    if (selectedCourse) {
      handleVisualize(selectedCourse)
    }
  }, [selectedCourse])

  const handleVisualize = async (courseId) => {
    const result = await getsummaire(courseId)
    if (result?.data) {
      setvdata(result.data)
      
      // Calculate dynamic KPIs from the summary data
      const dates = Object.keys(result.data).sort()
      if (dates.length > 0) {
        const latestDate = dates[dates.length - 1]
        const latestCount = result.data[latestDate]
        
        let previousCount = 0
        if (dates.length > 7) {
          const prevDate = dates[dates.length - 8] // roughly 7 days ago
          previousCount = result.data[prevDate]
        } else if (dates.length > 1) {
          previousCount = result.data[dates[0]]
        }
        
        const newReg = latestCount - previousCount
        const trend = previousCount > 0 ? ((newReg / previousCount) * 100).toFixed(1) : 0
        
        // Assuming a hardcoded capacity of 100 for visualization purposes since capacity isn't stored in DB yet
        const maxCapacity = 100
        const capacityUtil = Math.min(((latestCount / maxCapacity) * 100), 100).toFixed(1)

        setKpiData({
          totalEnrolled: latestCount,
          capacityUtil: capacityUtil,
          newRegistrations: newReg > 0 ? newReg : 0,
          trend: trend > 0 ? `+${trend}` : trend
        })
      } else {
        // No data case
        setKpiData({ totalEnrolled: 0, capacityUtil: 0, newRegistrations: 0, trend: 0 })
      }
    } else {
      setvdata(null)
      setKpiData({ totalEnrolled: 0, capacityUtil: 0, newRegistrations: 0, trend: 0 })
    }
  }

  if (!isAuthorized) return null

  return (
    <div className="bg-background-off-white min-h-screen">
      <Navigation isAdmin={true} />
      
      <main className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-12">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-4">
          <div>
            <h1 className="text-headline-lg font-headline-lg text-on-surface mb-2">Faculty Insights</h1>
            <p className="text-body-md font-body-md text-soft-gray">Monitor enrollment trends and course performance.</p>
          </div>
          
          {/* Dropdown moved to top right */}
          <div className="flex items-center gap-2 bg-white rounded-xl shadow-sm border border-surface-variant px-2 py-1">
            <span className="material-symbols-outlined text-soft-gray pl-2">filter_list</span>
            <select 
              className="bg-transparent border-none rounded-lg px-2 py-2 text-label-md font-label-md focus:ring-0 cursor-pointer min-w-[200px] outline-none"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              disabled={loading || courseOptions.length === 0}
            >
              {loading && <option value="">Loading courses...</option>}
              {!loading && courseOptions.length === 0 && <option value="">No courses available</option>}
              {!loading && courseOptions.map((courseId) => (
                <option key={courseId} value={courseId}>{courseId}</option>
              ))}
            </select>
          </div>
        </div>

        {/* KPI Row (Dynamic based on selected course) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-12">
          <div className="glass-card ambient-shadow rounded-xl p-8 border border-surface-variant bg-white/50">
            <div className="flex items-center justify-between mb-4">
              <span className="text-label-md font-label-md text-soft-gray">Enrolled in {selectedCourse || 'Course'}</span>
              <span className="material-symbols-outlined text-primary">group</span>
            </div>
            <div className="text-headline-lg font-headline-lg text-on-surface">{kpiData.totalEnrolled}</div>
            <div className="flex items-center mt-2 text-green-600">
              <span className="material-symbols-outlined text-sm">{kpiData.trend >= 0 ? 'trending_up' : 'trending_down'}</span>
              <span className="text-caption font-caption ml-1">{kpiData.trend}% past 7 days</span>
            </div>
          </div>
          
          <div className="glass-card ambient-shadow rounded-xl p-8 border border-surface-variant bg-white/50">
            <div className="flex items-center justify-between mb-4">
              <span className="text-label-md font-label-md text-soft-gray">Capacity Utilization</span>
              <span className="material-symbols-outlined text-primary">leaderboard</span>
            </div>
            <div className="text-headline-lg font-headline-lg text-on-surface">{kpiData.capacityUtil}%</div>
            <div className="w-full bg-surface-container h-1.5 rounded-full mt-4">
              <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${kpiData.capacityUtil}%` }}></div>
            </div>
          </div>

          <div className="glass-card ambient-shadow rounded-xl p-8 border border-surface-variant bg-white/50">
            <div className="flex items-center justify-between mb-4">
              <span className="text-label-md font-label-md text-soft-gray">Recent Registrations</span>
              <span className="material-symbols-outlined text-primary">person_add</span>
            </div>
            <div className="text-headline-lg font-headline-lg text-on-surface">{kpiData.newRegistrations}</div>
            <div className="flex items-center mt-2 text-primary">
              <span className="material-symbols-outlined text-sm">schedule</span>
              <span className="text-caption font-caption ml-1">Last 7 days</span>
            </div>
          </div>
        </div>

        {/* Visualization */}
        <div className="glass-card ambient-shadow rounded-xl p-8 border border-surface-variant bg-white">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-headline-md font-headline-md text-on-surface">Enrollment Timeline: {selectedCourse}</h3>
          </div>

          <div className="min-h-[450px] flex items-center justify-center bg-surface-container-low/30 rounded-xl border border-dashed border-outline-variant/50">
            {vdata ? (
              <div className="w-full p-4 h-full min-h-[450px]">
                <LineGraph
                  data={Object.entries(
                    Object.keys(vdata)
                      .sort()
                      .reduce(function (result, key) {
                        result[key] = vdata[key]
                        return result
                      }, {})
                  )}
                />
              </div>
            ) : (
              <div className="text-center text-soft-gray py-20">
                <span className="material-symbols-outlined text-[48px] mb-2 block">monitoring</span>
                <p className="font-body-md">No visualization data available for {selectedCourse}</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default AdminDashBoard

'use client'
import { useState, useEffect, useRef } from 'react'
import '../globals.css'
import Navigation from '@/src/components/Navigation'
import { useAuthContext } from '@/src/context/AuthContext'
import { useRouter } from 'next/navigation'
import LineGraph from './LineGraph'
import DonutChart from './DonutChart'
import CapacityBarChart from './CapacityBarChart'
import getsummaire from '@/src/firebase/firestore/getsummaire'
import getAllCourseIds from '@/src/firebase/firestore/getAllCourseIds'

const AdminDashBoard = () => {
  const { user, isAdmin } = useAuthContext()
  const router = useRouter()
  
  const [selectedCourse, setSelectedCourse] = useState('All Courses')
  const [vdata, setvdata] = useState(null)
  const [loading, setLoading] = useState(true)
  const [courseOptions, setCourseOptions] = useState([])
  const [courseStats, setCourseStats] = useState([])
  const [aggregatedData, setAggregatedData] = useState(null)
  const [activeVizTab, setActiveVizTab] = useState('timeline')
  
  // Custom Dropdown State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef(null)

  // Dynamic KPIs for the selected course
  const [kpiData, setKpiData] = useState({
    totalEnrolled: 0,
    capacityUtil: 0,
    newRegistrations: 0,
    trend: 0
  })

  useEffect(() => {
    if (user === null) {
      router.replace('/Login')
    } else if (isAdmin) {
      fetchCoursesAndStats()
    } else {
      router.replace('/UserDashBoard')
    }
  }, [user, isAdmin])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const fetchCoursesAndStats = async () => {
    setLoading(true)
    try {
      const result = await getAllCourseIds()
      if (result?.send && result.send.length > 0) {
        setCourseOptions(result.send)
        
        // Fetch stats for all courses to calculate "Popular Courses" and "All Courses" aggregates
        const stats = await Promise.all(result.send.map(async (id) => {
          const sumRes = await getsummaire(id)
          const dates = sumRes?.data ? Object.keys(sumRes.data).sort() : []
          const latestCount = dates.length > 0 ? sumRes.data[dates[dates.length - 1]] : 0
          return { id, count: latestCount, data: sumRes?.data || {} }
        }))
        
        // Sort for popular courses (top 5)
        const sortedStats = [...stats].sort((a, b) => b.count - a.count)
        setCourseStats(sortedStats)
        
        // Build aggregated data for "All Courses"
        const agg = {}
        stats.forEach(stat => {
          Object.keys(stat.data).forEach(date => {
            agg[date] = (agg[date] || 0) + stat.data[date]
          })
        })
        setAggregatedData(agg)
        
        setSelectedCourse('All Courses')
      }
    } catch (error) {
      console.error("Error fetching courses:", error)
    } finally {
      setLoading(false)
    }
  }

  // Update Data and KPIs when selectedCourse changes
  useEffect(() => {
    if (loading) return

    let currentData = null
    if (selectedCourse === 'All Courses') {
      currentData = aggregatedData
    } else {
      const course = courseStats.find(c => c.id === selectedCourse)
      currentData = course ? course.data : null
    }

    if (currentData && Object.keys(currentData).length > 0) {
      setvdata(currentData)
      
      const dates = Object.keys(currentData).sort()
      const latestDate = dates[dates.length - 1]
      const latestCount = currentData[latestDate]
      
      let previousCount = 0
      if (dates.length > 7) {
        const prevDate = dates[dates.length - 8] // roughly 7 days ago
        previousCount = currentData[prevDate]
      } else if (dates.length > 1) {
        previousCount = currentData[dates[0]]
      }
      
      const newReg = latestCount - previousCount
      const trend = previousCount > 0 ? ((newReg / previousCount) * 100).toFixed(1) : 0
      
      // If "All Courses", max capacity is 100 * number of courses. Else 100.
      const maxCapacity = selectedCourse === 'All Courses' ? (courseOptions.length * 100) : 100
      const capacityUtil = Math.min(((latestCount / maxCapacity) * 100), 100).toFixed(1)

      setKpiData({
        totalEnrolled: latestCount,
        capacityUtil: capacityUtil,
        newRegistrations: newReg > 0 ? newReg : 0,
        trend: trend > 0 ? `+${trend}` : trend
      })
    } else {
      setvdata(null)
      setKpiData({ totalEnrolled: 0, capacityUtil: 0, newRegistrations: 0, trend: 0 })
    }
  }, [selectedCourse, aggregatedData, courseStats, loading])

  const filteredOptions = courseOptions.filter(c => c.toLowerCase().includes(searchQuery.toLowerCase()))

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
          
          {/* Custom Searchable Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <div 
              className="flex items-center gap-2 bg-white rounded-xl shadow-sm border border-surface-variant px-4 py-3 cursor-pointer min-w-[240px] justify-between hover:border-primary transition-colors"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-soft-gray">filter_list</span>
                <span className="font-label-md text-on-surface">{selectedCourse}</span>
              </div>
              <span className="material-symbols-outlined text-soft-gray">{isDropdownOpen ? 'expand_less' : 'expand_more'}</span>
            </div>

            {isDropdownOpen && (
              <div className="absolute top-full mt-2 right-0 w-full bg-white rounded-xl shadow-lg border border-surface-variant z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div className="p-2 border-b border-surface-variant bg-surface-container-lowest">
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-soft-gray text-[18px]">search</span>
                    <input 
                      type="text" 
                      placeholder="Search courses..." 
                      className="w-full pl-8 pr-2 py-2 bg-surface-container-low rounded-lg text-body-md font-body-md outline-none focus:ring-1 focus:ring-primary"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
                <div className="max-h-[300px] overflow-y-auto p-1">
                  <div 
                    className={`px-4 py-3 rounded-lg cursor-pointer transition-colors ${selectedCourse === 'All Courses' ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-surface-container-low text-on-surface'}`}
                    onClick={() => { setSelectedCourse('All Courses'); setIsDropdownOpen(false); setSearchQuery(''); }}
                  >
                    All Courses
                  </div>
                  {filteredOptions.length === 0 ? (
                    <div className="px-4 py-3 text-soft-gray text-body-md">No courses found.</div>
                  ) : (
                    filteredOptions.map(courseId => (
                      <div 
                        key={courseId}
                        className={`px-4 py-3 rounded-lg cursor-pointer transition-colors ${selectedCourse === courseId ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-surface-container-low text-on-surface'}`}
                        onClick={() => { setSelectedCourse(courseId); setIsDropdownOpen(false); setSearchQuery(''); }}
                      >
                        {courseId}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-12">
          <div className="glass-card ambient-shadow rounded-xl p-8 border border-surface-variant bg-white/50">
            <div className="flex items-center justify-between mb-4">
              <span className="text-label-md font-label-md text-soft-gray">Enrolled in {selectedCourse}</span>
              <span className="material-symbols-outlined text-primary">group</span>
            </div>
            <div className="text-headline-lg font-headline-lg text-on-surface">{loading ? '-' : kpiData.totalEnrolled}</div>
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
            <div className="text-headline-lg font-headline-lg text-on-surface">{loading ? '-' : kpiData.capacityUtil}%</div>
            <div className="w-full bg-surface-container h-1.5 rounded-full mt-4 overflow-hidden">
              <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${kpiData.capacityUtil}%` }}></div>
            </div>
          </div>

          <div className="glass-card ambient-shadow rounded-xl p-8 border border-surface-variant bg-white/50">
            <div className="flex items-center justify-between mb-4">
              <span className="text-label-md font-label-md text-soft-gray">Recent Registrations</span>
              <span className="material-symbols-outlined text-primary">person_add</span>
            </div>
            <div className="text-headline-lg font-headline-lg text-on-surface">{loading ? '-' : kpiData.newRegistrations}</div>
            <div className="flex items-center mt-2 text-primary">
              <span className="material-symbols-outlined text-sm">schedule</span>
              <span className="text-caption font-caption ml-1">Last 7 days</span>
            </div>
          </div>
        </div>

        {/* Visualization & Popular Courses Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          
          {/* Visualization Block */}
          <div className="lg:col-span-8 space-y-gutter">
            <div className="glass-card ambient-shadow rounded-xl p-8 border border-surface-variant bg-white">
              
              {/* Visualization Header & Tabs */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-surface-variant/40 pb-4 mb-6 gap-4">
                <h3 className="text-headline-md font-headline-md text-on-surface">
                  {activeVizTab === 'timeline' ? `Enrollment Timeline: ${selectedCourse}` : activeVizTab === 'departments' ? 'Department breakdown' : 'Top 10 Capacity utilization'}
                </h3>
                
                {/* Horizontal Viz Selector Tabs */}
                <div className="flex bg-surface-container-low p-1 rounded-xl border border-surface-variant/20">
                  <button 
                    onClick={() => setActiveVizTab('timeline')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-label-md font-bold transition-all ${activeVizTab === 'timeline' ? 'bg-white text-primary shadow-sm' : 'text-soft-gray hover:text-on-surface'}`}
                  >
                    <span className="material-symbols-outlined text-[18px]">timeline</span>
                    Timeline
                  </button>
                  <button 
                    onClick={() => setActiveVizTab('departments')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-label-md font-bold transition-all ${activeVizTab === 'departments' ? 'bg-white text-primary shadow-sm' : 'text-soft-gray hover:text-on-surface'}`}
                  >
                    <span className="material-symbols-outlined text-[18px]">pie_chart</span>
                    Departments
                  </button>
                  <button 
                    onClick={() => setActiveVizTab('utilization')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-label-md font-bold transition-all ${activeVizTab === 'utilization' ? 'bg-white text-primary shadow-sm' : 'text-soft-gray hover:text-on-surface'}`}
                  >
                    <span className="material-symbols-outlined text-[18px]">leaderboard</span>
                    Utilization
                  </button>
                </div>
              </div>

              {/* Dynamic Chart Display based on Tab */}
              <div className="min-h-[450px] flex items-center justify-center bg-surface-container-low/30 rounded-xl border border-dashed border-outline-variant/50 p-4">
                {loading ? (
                  <div className="portal-spinner"></div>
                ) : activeVizTab === 'timeline' ? (
                  vdata ? (
                    <div className="w-full p-2 h-full min-h-[400px]">
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
                  )
                ) : activeVizTab === 'departments' ? (
                  <div className="w-full p-2 h-full min-h-[400px]">
                    <DonutChart courseStats={courseStats} />
                  </div>
                ) : (
                  <div className="w-full p-2 h-full min-h-[400px]">
                    <CapacityBarChart courseStats={courseStats} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Popular Courses Sidebar */}
          <div className="lg:col-span-4 space-y-gutter">
            <div className="glass-card ambient-shadow rounded-xl p-8 border border-surface-variant bg-white">
              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-primary">local_fire_department</span>
                <h3 className="text-headline-md font-headline-md text-on-surface">Popular Courses</h3>
              </div>
              
              <div className="space-y-4">
                {loading && <p className="text-soft-gray text-body-md">Loading...</p>}
                {!loading && courseStats.slice(0, 5).map((stat, idx) => (
                  <div 
                    key={stat.id} 
                    className={`flex flex-col p-4 rounded-xl cursor-pointer transition-all border ${selectedCourse === stat.id ? 'border-primary bg-primary/5 shadow-sm' : 'border-transparent hover:bg-surface-container-low'}`}
                    onClick={() => setSelectedCourse(stat.id)}
                  >
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-label-md font-bold text-soft-gray">#{idx + 1}</span>
                        <span className="text-label-md font-bold text-on-surface">{stat.id}</span>
                      </div>
                      <span className="text-label-md font-label-md text-primary">{stat.count} Enrolled</span>
                    </div>
                    {/* Capacity bar assuming 100 max for visualization */}
                    <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden mt-1">
                      <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${Math.min((stat.count / 100) * 100, 100)}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}

export default AdminDashBoard

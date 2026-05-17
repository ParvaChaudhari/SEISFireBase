import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

const DonutChart = ({ courseStats }) => {
  const svgRef = useRef()
  const containerRef = useRef()
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, name: '', value: 0, percentage: 0 })

  useEffect(() => {
    if (!courseStats || courseStats.length === 0) return

    const handleResize = () => {
      const containerWidth = containerRef.current.clientWidth
      const containerHeight = 350
      
      const width = containerWidth
      const height = containerHeight
      const radius = Math.min(width, height) / 2 - 20

      // Group data by Department prefix (e.g. CS101 -> CS, BIO201 -> BIO)
      const deptMap = {}
      let totalCount = 0

      courseStats.forEach(course => {
        const dept = course.id.split(/[0-9]/)[0] || 'Other'
        deptMap[dept] = (deptMap[dept] || 0) + course.count
        totalCount += course.count
      })

      const formattedData = Object.entries(deptMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)

      const svg = d3.select(svgRef.current)
        .attr('width', width)
        .attr('height', height)

      // Persistent chart group centered
      let chartGroup = svg.select('.chart-group')
      if (chartGroup.empty()) {
        chartGroup = svg.append('g')
          .attr('class', 'chart-group')
      }
      chartGroup.attr('transform', `translate(${width / 2}, ${height / 2})`)

      // Color scale
      const color = d3.scaleOrdinal()
        .domain(formattedData.map(d => d.name))
        .range(['#007aff', '#34c759', '#ff9500', '#af52de', '#ff3b30', '#5856d6', '#00c7be', '#ff2d55'])

      const pie = d3.pie()
        .value(d => d.value)
        .sort(null)

      const arc = d3.arc()
        .innerRadius(radius * 0.6) // Donut cutout size
        .outerRadius(radius)

      const arcHover = d3.arc()
        .innerRadius(radius * 0.6)
        .outerRadius(radius + 8)

      // Bind data to slices
      const slices = chartGroup.selectAll('path')
        .data(pie(formattedData), d => d.data.name)

      // EXIT old slices
      slices.exit().remove()

      // ENTER + UPDATE slices
      const newSlices = slices.enter()
        .append('path')
        .merge(slices)
        .attr('fill', d => color(d.data.name))
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)
        .style('cursor', 'pointer')
        .transition()
        .duration(800)
        .attrTween('d', function(d) {
          const i = d3.interpolate({ startAngle: 0, endAngle: 0 }, d)
          return function(t) { return arc(i(t)) }
        })

      // Hover events
      chartGroup.selectAll('path')
        .on('mouseover', function(event, d) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('d', arcHover)

          const percent = ((d.data.value / totalCount) * 100).toFixed(1)
          
          setTooltip({
            show: true,
            x: event.layerX || event.clientX - containerRef.current.getBoundingClientRect().left,
            y: event.layerY || event.clientY - containerRef.current.getBoundingClientRect().top - 40,
            name: d.data.name,
            value: d.data.value,
            percentage: percent
          })
        })
        .on('mousemove', function(event) {
          setTooltip(prev => ({
            ...prev,
            x: event.layerX || event.clientX - containerRef.current.getBoundingClientRect().left,
            y: event.layerY || event.clientY - containerRef.current.getBoundingClientRect().top - 40
          }))
        })
        .on('mouseout', function() {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('d', arc)

          setTooltip(prev => ({ ...prev, show: false }))
        })
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [courseStats])

  return (
    <div ref={containerRef} className="w-full relative flex flex-col items-center">
      <svg ref={svgRef} className="overflow-visible"></svg>

      {/* Interactive Tooltip */}
      {tooltip.show && (
        <div 
          className="absolute bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-xl border border-surface-variant shadow-lg pointer-events-none z-30"
          style={{ 
            left: `${tooltip.x}px`, 
            top: `${tooltip.y}px`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <div className="flex flex-col gap-0.5 text-center">
            <span className="text-caption font-bold text-soft-gray tracking-wider uppercase text-[10px]">Department</span>
            <span className="text-body-md font-bold text-on-surface text-[16px]">{tooltip.name} Division</span>
            <span className="text-primary font-bold text-[14px]">{tooltip.value} Students ({tooltip.percentage}%)</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default DonutChart

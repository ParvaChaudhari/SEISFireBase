import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

const LineGraph = ({ data }) => {
  const svgRef = useRef()
  const containerRef = useRef()
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, date: '', value: 0 })

  useEffect(() => {
    if (!data || data.length === 0) return

    const handleResize = () => {
      const containerWidth = containerRef.current.clientWidth
      const containerHeight = 400
      
      const margin = { top: 30, right: 30, bottom: 40, left: 50 }
      const width = containerWidth - margin.left - margin.right
      const height = containerHeight - margin.top - margin.bottom

      // Parse dates
      const parseDate = d3.timeParse('%Y-%m-%d')
      const formattedData = data.map(d => ({
        date: parseDate(d[0]),
        value: d[1]
      })).filter(d => d.date !== null)

      // Set up scales
      const x = d3.scaleTime()
        .domain(d3.extent(formattedData, d => d.date))
        .range([0, width])

      const y = d3.scaleLinear()
        .domain([0, d3.max(formattedData, d => d.value) * 1.15])
        .range([height, 0])

      // Line generator
      const line = d3.line()
        .x(d => x(d.date))
        .y(d => y(d.value))
        .curve(d3.curveMonotoneX)

      const svg = d3.select(svgRef.current)
        .attr('width', containerWidth)
        .attr('height', containerHeight)

      // Add Gradient defs if not present
      let defs = svg.select('defs')
      if (defs.empty()) {
        defs = svg.append('defs')
        const gradient = defs.append('linearGradient')
          .attr('id', 'line-gradient')
          .attr('x1', '0%').attr('y1', '0%')
          .attr('x2', '0%').attr('y2', '100%')

        gradient.append('stop')
          .attr('offset', '0%')
          .attr('stop-color', '#007aff')
          .attr('stop-opacity', 0.2)

        gradient.append('stop')
          .attr('offset', '100%')
          .attr('stop-color', '#007aff')
          .attr('stop-opacity', 0.0)
      }

      // Clear layout and build clean chart structure if not present
      let chartGroup = svg.select('.chart-group')
      if (chartGroup.empty()) {
        chartGroup = svg.append('g')
          .attr('class', 'chart-group')
          .attr('transform', `translate(${margin.left}, ${margin.top})`)

        // Append base elements once
        chartGroup.append('g').attr('class', 'x-axis')
        chartGroup.append('g').attr('class', 'y-axis')
        chartGroup.append('path').attr('class', 'area-path')
        chartGroup.append('path').attr('class', 'line-path')
        
        // Hover line
        chartGroup.append('line')
          .attr('class', 'focus-line')
          .attr('y1', 0)
          .attr('y2', height)
          .attr('stroke', '#007aff')
          .attr('stroke-width', 1)
          .attr('stroke-dasharray', '4 4')
          .style('opacity', 0)

        // Hover indicator dot
        chartGroup.append('circle')
          .attr('class', 'focus-dot')
          .attr('r', 6)
          .attr('fill', '#007aff')
          .attr('stroke', '#fff')
          .attr('stroke-width', 2)
          .style('opacity', 0)

        // Overlay rect to capture pointer events
        chartGroup.append('rect')
          .attr('class', 'overlay')
          .attr('fill', 'none')
          .attr('pointer-events', 'all')
      }

      // Update axes with transitions
      chartGroup.select('.x-axis')
        .attr('transform', `translate(0, ${height})`)
        .transition()
        .duration(800)
        .call(d3.axisBottom(x).ticks(6))
        .attr('class', 'x-axis text-soft-gray font-label-md')

      chartGroup.select('.y-axis')
        .transition()
        .duration(800)
        .call(d3.axisLeft(y).ticks(5))
        .attr('class', 'y-axis text-soft-gray font-label-md')

      // Area generator
      const area = d3.area()
        .x(d => x(d.date))
        .y0(height)
        .y1(d => y(d.value))
        .curve(d3.curveMonotoneX)

      // Transition the area path smoothly!
      let areaPath = chartGroup.select('.area-path')
      if (areaPath.empty()) {
        areaPath = chartGroup.append('path').attr('class', 'area-path')
      }
      areaPath.datum(formattedData)

      if (!areaPath.attr('d')) {
        areaPath.attr('d', area)
      } else {
        areaPath.transition()
          .duration(800)
          .attr('d', area)
      }

      areaPath.attr('fill', 'url(#line-gradient)')

      // Transition the line path smoothly!
      let path = chartGroup.select('.line-path')
      if (path.empty()) {
        path = chartGroup.append('path').attr('class', 'line-path')
      }
      path.datum(formattedData)

      // If it's a completely new draw (or empty path), draw instantly. Otherwise, morph it.
      if (!path.attr('d')) {
        path.attr('d', line)
      } else {
        path.transition()
          .duration(800)
          .attr('d', line)
      }

      path
        .attr('fill', 'none')
        .attr('stroke', '#007aff')
        .attr('stroke-width', 2)

      // Update overlay dimension
      const overlay = chartGroup.select('.overlay')
        .attr('width', width)
        .attr('height', height)

      // Setup interactive tooltip tracker
      const bisectDate = d3.bisector(d => d.date).left

      overlay
        .on('mousemove touchmove', function (event) {
          const mouseX = d3.pointer(event)[0]
          const x0 = x.invert(mouseX)
          const i = bisectDate(formattedData, x0, 1)
          
          if (i >= formattedData.length) return

          const d0 = formattedData[i - 1]
          const d1 = formattedData[i]
          const d = x0 - d0.date > d1.date - x0 ? d1 : d0

          const focusX = x(d.date)
          const focusY = y(d.value)

          // Update tracking line and dot
          chartGroup.select('.focus-line')
            .attr('x1', focusX)
            .attr('x2', focusX)
            .attr('y2', height)
            .style('opacity', 1)

          chartGroup.select('.focus-dot')
            .attr('cx', focusX)
            .attr('cy', focusY)
            .style('opacity', 1)

          // Position HTML tooltip
          const containerRect = containerRef.current.getBoundingClientRect()
          setTooltip({
            show: true,
            x: focusX + margin.left + 15,
            y: focusY + margin.top - 50,
            date: d3.timeFormat('%B %d, %Y')(d.date),
            value: d.value
          })
        })
        .on('mouseleave touchend', function () {
          chartGroup.select('.focus-line').style('opacity', 0)
          chartGroup.select('.focus-dot').style('opacity', 0)
          setTooltip(prev => ({ ...prev, show: false }))
        })
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [data])

  return (
    <div ref={containerRef} className="w-full relative">
      <svg ref={svgRef} className="overflow-visible"></svg>
      
      {/* Premium HTML Tooltip */}
      {tooltip.show && (
        <div 
          className="absolute bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-xl border border-surface-variant shadow-lg pointer-events-none transition-all duration-75 ease-out z-30"
          style={{ 
            left: `${tooltip.x}px`, 
            top: `${tooltip.y}px`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-caption font-bold text-soft-gray tracking-wider uppercase text-[10px]">Active Students</span>
            <span className="text-body-md font-bold text-primary text-[16px]">{tooltip.value} Enrolled</span>
            <span className="text-[11px] text-on-surface-variant/70">{tooltip.date}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default LineGraph

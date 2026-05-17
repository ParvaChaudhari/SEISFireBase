import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

const CapacityBarChart = ({ courseStats }) => {
  const svgRef = useRef()
  const containerRef = useRef()
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, id: '', count: 0, pct: 0 })

  useEffect(() => {
    if (!courseStats || courseStats.length === 0) return

    const handleResize = () => {
      // Show top 10 courses for optimal visual fitting
      const data = courseStats.slice(0, 10)
      const containerWidth = containerRef.current.clientWidth
      const containerHeight = 380

      const margin = { top: 20, right: 30, bottom: 30, left: 130 }
      const width = containerWidth - margin.left - margin.right
      const height = containerHeight - margin.top - margin.bottom

      const svg = d3.select(svgRef.current)
        .attr('width', containerWidth)
        .attr('height', containerHeight)

      let chartGroup = svg.select('.chart-group')
      if (chartGroup.empty()) {
        chartGroup = svg.append('g')
          .attr('class', 'chart-group')
          .attr('transform', `translate(${margin.left}, ${margin.top})`)

        chartGroup.append('g').attr('class', 'x-axis')
        chartGroup.append('g').attr('class', 'y-axis')
      }

      // X scale represents percentage (capped at 100%)
      const x = d3.scaleLinear()
        .domain([0, 100])
        .range([0, width])

      // Y scale represents course IDs
      const y = d3.scaleBand()
        .domain(data.map(d => d.id))
        .range([0, height])
        .padding(0.25)

      // Axes transitions
      chartGroup.select('.x-axis')
        .attr('transform', `translate(0, ${height})`)
        .transition()
        .duration(800)
        .call(d3.axisBottom(x).ticks(5).tickFormat(d => `${d}%`))
        .attr('class', 'x-axis text-soft-gray font-label-md')

      chartGroup.select('.y-axis')
        .transition()
        .duration(800)
        .call(d3.axisLeft(y))
        .attr('class', 'y-axis text-on-surface font-bold text-label-md')

      // Bind data to bars
      const bars = chartGroup.selectAll('.bar')
        .data(data, d => d.id)

      // EXIT
      bars.exit().remove()

      // ENTER + UPDATE with smooth growth animation
      const newBars = bars.enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('y', d => y(d.id))
        .attr('height', y.bandwidth())
        .attr('x', 0)
        .attr('width', 0) // start at 0 width for entry growth
        .merge(bars)

      newBars.transition()
        .duration(800)
        .attr('y', d => y(d.id))
        .attr('height', y.bandwidth())
        .attr('width', d => x(Math.min((d.count / 100) * 100, 100))) // capacity assumes 100 limit
        .attr('fill', d => {
          const pct = (d.count / 100) * 100
          if (pct >= 80) return '#007aff' // Premium Blue (high utilization)
          if (pct >= 50) return '#34c759' // Safe Green
          return '#ff9500' // Warning Orange (under utilization)
        })
        .attr('rx', 4) // Rounded bar corners

      // Interactive hover
      newBars
        .style('cursor', 'pointer')
        .on('mouseover', function(event, d) {
          const pct = Math.min((d.count / 100) * 100, 100).toFixed(0)
          
          setTooltip({
            show: true,
            x: event.layerX || event.clientX - containerRef.current.getBoundingClientRect().left,
            y: event.layerY || event.clientY - containerRef.current.getBoundingClientRect().top - 40,
            id: d.id,
            count: d.count,
            pct: pct
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
          setTooltip(prev => ({ ...prev, show: false }))
        })
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [courseStats])

  return (
    <div ref={containerRef} className="w-full relative">
      <svg ref={svgRef} className="overflow-visible"></svg>

      {/* Tooltip overlay */}
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
            <span className="text-caption font-bold text-soft-gray tracking-wider uppercase text-[10px]">{tooltip.id}</span>
            <span className="text-body-md font-bold text-on-surface text-[15px]">{tooltip.pct}% Capacity Utilized</span>
            <span className="text-primary font-bold text-[13px]">{tooltip.count} / 100 Enrolled</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default CapacityBarChart

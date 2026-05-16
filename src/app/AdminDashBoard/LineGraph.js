import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

const LineGraph = ({ data }) => {
  const svgRef = useRef()
  const containerRef = useRef()

  useEffect(() => {
    if (!data || data.length === 0) return

    const handleResize = () => {
      const containerWidth = containerRef.current.clientWidth
      const containerHeight = 400
      
      const svg = d3.select(svgRef.current)
      svg.selectAll('*').remove()

      const margin = { top: 20, right: 30, bottom: 40, left: 50 }
      const width = containerWidth - margin.left - margin.right
      const height = containerHeight - margin.top - margin.bottom

      // Parse dates
      const parseDate = d3.timeParse('%Y-%m-%d')
      const formattedData = data.map(d => ({
        date: parseDate(d[0]),
        value: d[1]
      }))

      // Set up scales
      const x = d3.scaleTime()
        .domain(d3.extent(formattedData, d => d.date))
        .range([0, width])

      const y = d3.scaleLinear()
        .domain([0, d3.max(formattedData, d => d.value) * 1.1])
        .range([height, 0])

      // Create line generator
      const line = d3.line()
        .x(d => x(d.date))
        .y(d => y(d.value))
        .curve(d3.curveMonotoneX)

      const chartGroup = svg
        .attr('width', containerWidth)
        .attr('height', containerHeight)
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`)

      // Add Grid Lines
      chartGroup.append('g')
        .attr('class', 'grid')
        .attr('opacity', 0.1)
        .call(d3.axisLeft(y).tickSize(-width).tickFormat(''))

      // Add Axes
      chartGroup.append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(x).ticks(6))
        .attr('class', 'text-soft-gray font-label-md')

      chartGroup.append('g')
        .call(d3.axisLeft(y).ticks(5))
        .attr('class', 'text-soft-gray font-label-md')

      // Add Gradient
      const gradient = svg.append("defs")
        .append("linearGradient")
        .attr("id", "line-gradient")
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", 0).attr("y1", y(0))
        .attr("x2", 0).attr("y2", y(d3.max(formattedData, d => d.value)))

      gradient.append("stop").attr("offset", "0%").attr("stop-color", "#004e9f").attr("stop-opacity", 0.1)
      gradient.append("stop").attr("offset", "100%").attr("stop-color", "#004e9f").attr("stop-opacity", 0.3)

      // Add Area
      const area = d3.area()
        .x(d => x(d.date))
        .y0(height)
        .y1(d => y(d.value))
        .curve(d3.curveMonotoneX)

      chartGroup.append('path')
        .datum(formattedData)
        .attr('d', area)
        .attr('fill', 'url(#line-gradient)')

      // Add Line
      chartGroup.append('path')
        .datum(formattedData)
        .attr('d', line)
        .attr('fill', 'none')
        .attr('stroke', '#004e9f')
        .attr('stroke-width', 3)

      // Add Dots
      chartGroup.selectAll('.dot')
        .data(formattedData)
        .enter()
        .append('circle')
        .attr('cx', d => x(d.date))
        .attr('cy', d => y(d.value))
        .attr('r', 4)
        .attr('fill', '#004e9f')
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)
        .on('mouseover', function(event, d) {
          d3.select(this).transition().attr('r', 6)
        })
        .on('mouseout', function() {
          d3.select(this).transition().attr('r', 4)
        })
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [data])

  return (
    <div ref={containerRef} className="w-full">
      <svg ref={svgRef} className="overflow-visible"></svg>
    </div>
  )
}

export default LineGraph


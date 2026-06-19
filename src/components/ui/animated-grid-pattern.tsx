"use client"

import {
  type PropsWithChildren,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
} from "react"

import { cn } from "@/lib/utils"

export interface AnimatedGridPatternProps extends ComponentPropsWithoutRef<"div"> {
  /** Grid cell width in px (default: 40) */
  width?: number
  /** Grid cell height in px (default: 40) */
  height?: number
  /** Pattern X offset (default: -1) */
  x?: number
  /** Pattern Y offset (default: -1) */
  y?: number
  /** Stroke dash array (default: 0) */
  strokeDasharray?: number
  /** CSS color for the hovered cell (default: currentColor) */
  primaryColor?: string
  /** CSS color for adjacent cells (default: same as primaryColor) */
  glowColor?: string
  /** How many rings of cells around the hovered cell glow (default: 2) */
  glowRadius?: number
  /** Base opacity of grid lines (default: 0.08) */
  gridLineOpacity?: number
}

const GLOW_OPACITIES = [0, 0.45, 0.18, 0.08, 0.04]

export function AnimatedGridPattern({
  children,
  width = 40,
  height = 40,
  x = -1,
  y = -1,
  strokeDasharray = 0,
  className,
  primaryColor = "currentColor",
  glowColor,
  glowRadius = 2,
  gridLineOpacity = 0.08,
  ...props
}: PropsWithChildren<AnimatedGridPatternProps>) {
  const id = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [hoveredCell, setHoveredCell] = useState<{
    col: number
    row: number
  } | null>(null)

  const cols = Math.floor(dimensions.width / width)
  const rows = Math.floor(dimensions.height / height)

  // --- Mouse tracking ---

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const mouseX = e.clientX - rect.left + containerRef.current.scrollLeft
      const mouseY = e.clientY - rect.top + containerRef.current.scrollTop
      const col = Math.floor(mouseX / width)
      const row = Math.floor(mouseY / height)
      if (col >= 0 && col < cols && row >= 0 && row < rows) {
        setHoveredCell({ col, row })
      }
    },
    [width, height, cols, rows],
  )

  const handleMouseLeave = useCallback(() => {
    setHoveredCell(null)
  }, [])

  // --- Compute visible glowing cells (only render within glowRadius of cursor) ---

  const visibleCells = useMemo(() => {
    if (!hoveredCell) return []
    const cells: { col: number; row: number; distance: number }[] = []
    for (let dr = -glowRadius; dr <= glowRadius; dr++) {
      for (let dc = -glowRadius; dc <= glowRadius; dc++) {
        const col = hoveredCell.col + dc
        const row = hoveredCell.row + dr
        if (col >= 0 && col < cols && row >= 0 && row < rows) {
          cells.push({
            col,
            row,
            distance: Math.max(Math.abs(dc), Math.abs(dr)),
          })
        }
      }
    }
    return cells
  }, [hoveredCell, glowRadius, cols, rows])

  // --- Resize observer ---

  useEffect(() => {
    const element = containerRef.current
    let resizeObserver: ResizeObserver | null = null

    if (element) {
      resizeObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
          setDimensions(prev => {
            const nextWidth = entry.contentRect.width
            const nextHeight = entry.contentRect.height
            if (prev.width === nextWidth && prev.height === nextHeight)
              return prev
            return { width: nextWidth, height: nextHeight }
          })
        }
      })
      resizeObserver.observe(element)
    }

    return () => {
      if (resizeObserver) resizeObserver.disconnect()
    }
  }, [])

  const resolvedGlowColor = glowColor || primaryColor

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden",
        className,
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <pattern
            id={id}
            width={width}
            height={height}
            patternUnits="userSpaceOnUse"
            x={x}
            y={y}
          >
            <path
              d={`M.5 ${height}V.5H${width}`}
              fill="none"
              stroke="currentColor"
              strokeOpacity={gridLineOpacity}
              strokeDasharray={strokeDasharray}
            />
          </pattern>
        </defs>

        {/* Base grid pattern */}
        <rect width="100%" height="100%" fill={`url(#${id})`} />

        {/* Glowing cells */}
        {visibleCells.map(cell => {
          const isHovered = cell.distance === 0
          const opacityIndex = Math.min(cell.distance, GLOW_OPACITIES.length - 1)
          const opacity = GLOW_OPACITIES[opacityIndex] ?? 0
          if (opacity === 0) return null

          return (
            <rect
              key={`${cell.col}-${cell.row}`}
              x={cell.col * width + 1}
              y={cell.row * height + 1}
              width={width - 1}
              height={height - 1}
              fill={isHovered ? primaryColor : resolvedGlowColor}
              fillOpacity={opacity}
              className="transition-[fill-opacity] duration-150 ease-out"
            />
          )
        })}
      </svg>
      {children}
    </div>
  )
}

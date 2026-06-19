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
  /** Grid line stroke-width (default: 0.5 — hairline) */
  strokeWidth?: number
  /** Grid line color (default: currentColor) */
  gridLineColor?: string
  /** CSS color for the hovered cell (default: currentColor) */
  primaryColor?: string
  /** CSS color for adjacent cells (default: same as primaryColor) */
  glowColor?: string
  /** How many rings of cells around the hovered cell glow (default: 2) */
  glowRadius?: number
  /** Base opacity of grid lines (default: 0.08) */
  gridLineOpacity?: number
  /** Rotate the grid to create a diamond pattern (default: false) */
  rotated?: boolean
}

const GLOW_OPACITIES = [0.5, 0.25, 0.1, 0.04]

const SQRT2 = 1.41421356237

export function AnimatedGridPattern({
  children,
  width = 40,
  height = 40,
  x = -1,
  y = -1,
  strokeDasharray = 0,
  strokeWidth = 0.5,
  gridLineColor,
  className,
  primaryColor = "currentColor",
  glowColor,
  glowRadius = 2,
  gridLineOpacity = 0.15,
  rotated = false,
  ...props
}: PropsWithChildren<AnimatedGridPatternProps>) {
  const id = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [hoveredCell, setHoveredCell] = useState<{
    col: number
    row: number
  } | null>(null)

  const cx = dimensions.width / 2
  const cy = dimensions.height / 2

  // When rotated, the grid visual cell count changes because the pattern
  // is rotated 45°, so we compute a larger virtual grid to cover corners.
  const rotScale = rotated ? SQRT2 : 1
  const virtualWidth = dimensions.width * rotScale
  const virtualHeight = dimensions.height * rotScale
  const cols = Math.floor(virtualWidth / width)
  const rows = Math.floor(virtualHeight / height)

  // --- Mouse tracking with optional inverse rotation ---

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      let mouseX = e.clientX - rect.left + containerRef.current.scrollLeft
      let mouseY = e.clientY - rect.top + containerRef.current.scrollTop

      if (rotated) {
        // Inverse rotation by -45° around center to map screen coords → pattern space
        const dx = mouseX - cx
        const dy = mouseY - cy
        const cos45 = SQRT2 / 2
        const sin45 = SQRT2 / 2
        mouseX = dx * cos45 + dy * sin45 + virtualWidth / 2
        mouseY = -dx * sin45 + dy * cos45 + virtualHeight / 2
      }

      const col = Math.floor(mouseX / width)
      const row = Math.floor(mouseY / height)
      if (col >= 0 && col < cols && row >= 0 && row < rows) {
        setHoveredCell({ col, row })
      }
    },
    [width, height, cols, rows, rotated, cx, cy, virtualWidth, virtualHeight],
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
            patternTransform={rotated ? `rotate(45)` : undefined}
          >
            <path
              d={`M.5 ${height}V.5H${width}`}
              fill="none"
              stroke={gridLineColor ?? "currentColor"}
              strokeWidth={strokeWidth}
              strokeOpacity={gridLineOpacity}
              strokeDasharray={strokeDasharray}
            />
          </pattern>
        </defs>

        {/* Base grid pattern */}
        <rect width="100%" height="100%" fill={`url(#${id})`} />

        {/* Glowing cells */}
        <g transform={rotated ? `rotate(45, ${cx}, ${cy})` : undefined}>
        {visibleCells.map(cell => {
          const isHovered = cell.distance === 0
          if (isHovered) {
            return (
              <rect
                key={`${cell.col}-${cell.row}`}
                x={cell.col * width + 1}
                y={cell.row * height + 1}
                width={width - 1}
                height={height - 1}
                fill={primaryColor}
                fillOpacity={1}
                className="transition-[fill-opacity] duration-150 ease-out"
              />
            )
          }

          const glowIndex = Math.min(cell.distance - 1, GLOW_OPACITIES.length - 1)
          const opacity = GLOW_OPACITIES[glowIndex] ?? 0
          if (opacity === 0) return null

          return (
            <rect
              key={`${cell.col}-${cell.row}`}
              x={cell.col * width + 1}
              y={cell.row * height + 1}
              width={width - 1}
              height={height - 1}
              fill={resolvedGlowColor}
              fillOpacity={opacity}
              className="transition-[fill-opacity] duration-150 ease-out"
            />
          )
        })}
        </g>
      </svg>
      {children}
    </div>
  )
}

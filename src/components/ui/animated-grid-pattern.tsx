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
const COS45 = SQRT2 / 2
const SIN45 = SQRT2 / 2

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

  // When rotated, the pattern rect and highlights share a single rotated group
  // `rotate(45, cx, cy)` so they perfectly align. The pattern rect is oversized
  // to cover viewport corners after rotation.
  const span = rotated
    ? Math.ceil((dimensions.width + dimensions.height) / Math.min(width, height))
    : Math.max(
        Math.ceil(dimensions.width / width),
        Math.ceil(dimensions.height / height),
      )
  const halfSpan = Math.ceil(span / 2) + glowRadius
  const centerCol = rotated ? Math.floor(cx / width) : 0
  const centerRow = rotated ? Math.floor(cy / height) : 0
  const minCol = centerCol - halfSpan
  const maxCol = centerCol + halfSpan
  const minRow = centerRow - halfSpan
  const maxRow = centerRow + halfSpan

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const mouseX = e.clientX - rect.left + containerRef.current.scrollLeft
      const mouseY = e.clientY - rect.top + containerRef.current.scrollTop

      // Convert screen coords to group/pattern space
      let gx: number, gy: number
      if (rotated) {
        // Inverse of rotate(45, cx, cy):
        // 1. translate -center, 2. rotate -45°, 3. translate +center
        const dx = mouseX - cx
        const dy = mouseY - cy
        gx = dx * COS45 + dy * SIN45 + cx
        gy = -dx * SIN45 + dy * COS45 + cy
      } else {
        gx = mouseX
        gy = mouseY
      }

      const col = Math.floor(gx / width)
      const row = Math.floor(gy / height)
      if (col >= minCol && col <= maxCol && row >= minRow && row <= maxRow) {
        setHoveredCell({ col, row })
      }
    },
    [width, height, rotated, cx, cy, minCol, maxCol, minRow, maxRow],
  )

  const handleMouseLeave = useCallback(() => {
    setHoveredCell(null)
  }, [])

  const visibleCells = useMemo(() => {
    if (!hoveredCell) return []
    const cells: { col: number; row: number; distance: number }[] = []
    for (let dr = -glowRadius; dr <= glowRadius; dr++) {
      for (let dc = -glowRadius; dc <= glowRadius; dc++) {
        const col = hoveredCell.col + dc
        const row = hoveredCell.row + dr
        if (col >= minCol && col <= maxCol && row >= minRow && row <= maxRow) {
          cells.push({
            col,
            row,
            distance: Math.max(Math.abs(dc), Math.abs(dr)),
          })
        }
      }
    }
    return cells
  }, [hoveredCell, glowRadius, minCol, maxCol, minRow, maxRow])

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

  // Shared defs (not affected by rotation — patternUnits="userSpaceOnUse"
  // resolves inside whichever coordinate system the <rect> lives in).
  const defs = (
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
          stroke={gridLineColor ?? "currentColor"}
          strokeWidth={strokeWidth}
          strokeOpacity={gridLineOpacity}
          strokeDasharray={strokeDasharray}
        />
      </pattern>
    </defs>
  )

  const cellRects = visibleCells.map(cell => {
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
  })

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
        {defs}

        {rotated ? (
          // Single shared rotation group: pattern filled rect + highlights
          // are BOTH rotated by the same transform around the same center.
          // This guarantees pixel-perfect alignment.
          <g transform={`rotate(45, ${cx}, ${cy})`}>
            <rect
              x={-dimensions.width}
              y={-dimensions.height}
              width={dimensions.width * 3}
              height={dimensions.height * 3}
              fill={`url(#${id})`}
            />
            {cellRects}
          </g>
        ) : (
          <>
            <rect width="100%" height="100%" fill={`url(#${id})`} />
            {cellRects}
          </>
        )}
      </svg>
      {children}
    </div>
  )
}

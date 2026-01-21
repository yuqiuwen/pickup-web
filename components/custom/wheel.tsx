"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type WheelItem = { key: string; label: React.ReactNode; disabled?: boolean }

const ITEM_HEIGHT = 36
const PADDING_ITEMS = 3 // 上下各 3 行 padding，让中间对齐

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

export function WheelColumn(props: {
  items: WheelItem[]
  valueKey: string
  onValueKeyChange: (key: string) => void
  className?: string
  ariaLabel?: string
}) {
  const { items, valueKey, onValueKeyChange, className, ariaLabel } = props

  const viewportRef = React.useRef<HTMLDivElement | null>(null)
  const padPx = ITEM_HEIGHT * PADDING_ITEMS

  const settleTimer = React.useRef<number | null>(null)
  const dragging = React.useRef(false)
  const dragStartY = React.useRef(0)
  const dragStartScrollTop = React.useRef(0)

  const indexOfValue = React.useMemo(() => {
    const idx = items.findIndex((i) => i.key === valueKey)
    return idx >= 0 ? idx : 0
  }, [items, valueKey])

  const scrollToIndex = React.useCallback(
    (idx: number, behavior: ScrollBehavior) => {
      const el = viewportRef.current
      if (!el) return
      el.scrollTo({ top: padPx + idx * ITEM_HEIGHT, behavior })
    },
    [padPx]
  )

  const settle = React.useCallback(() => {
    const el = viewportRef.current
    if (!el) return

    const raw = (el.scrollTop - padPx) / ITEM_HEIGHT
    let idx = clamp(Math.round(raw), 0, Math.max(0, items.length - 1))

    // 跳过 disabled（如果你不需要 disabled 可删除这段）
    while (items[idx]?.disabled && idx < items.length - 1) idx++
    while (items[idx]?.disabled && idx > 0) idx--

    scrollToIndex(idx, "smooth")

    const k = items[idx]?.key
    if (k && k !== valueKey) onValueKeyChange(k)
  }, [items, onValueKeyChange, padPx, scrollToIndex, valueKey])

  // 外部 value 变化时对齐滚动位置
  React.useEffect(() => {
    scrollToIndex(indexOfValue, "auto")
  }, [indexOfValue, scrollToIndex])

  return (
    <div className={cn("relative w-[110px]", className)}>
      {/* 渐隐遮罩：用 mask-image（同时写 webkit 兼容） */}
      <div
        ref={viewportRef}
        aria-label={ariaLabel}
        className={cn(
          "h-[252px] overflow-y-auto overscroll-contain",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          "snap-y snap-mandatory",
          "touch-pan-y" // 允许触摸滚动（浏览器原生）
        )}
        style={{
          WebkitOverflowScrolling: "touch",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent, black 18%, black 82%, transparent)",
          maskImage:
            "linear-gradient(to bottom, transparent, black 18%, black 82%, transparent)",
        }}
        onWheel={(e) => {
          // 防止滚轮事件传到页面导致页面滚动（视情况可删）
          e.stopPropagation()
        }}
        onScroll={() => {
          if (dragging.current) return
          if (settleTimer.current) window.clearTimeout(settleTimer.current)
          settleTimer.current = window.setTimeout(settle, 80)
        }}
        // 关键：pointer 拖拽滚动（解决“点在 button 上拖不动/很难拖动”的问题）
        onPointerDown={(e) => {
          const el = viewportRef.current
          if (!el) return
          dragging.current = true
          dragStartY.current = e.clientY
          dragStartScrollTop.current = el.scrollTop
          ;(e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId)
        }}
        onPointerMove={(e) => {
          if (!dragging.current) return
          const el = viewportRef.current
          if (!el) return
          const dy = e.clientY - dragStartY.current
          el.scrollTop = dragStartScrollTop.current - dy
        }}
        onPointerUp={() => {
          dragging.current = false
          settle()
        }}
        onPointerCancel={() => {
          dragging.current = false
          settle()
        }}
      >
        <div style={{ height: padPx }} />
        {items.map((it) => {
          const selected = it.key === valueKey
          return (
            <div
              key={it.key}
              className={cn(
                "h-9 snap-center px-2 text-sm flex items-center justify-center rounded-md select-none",
                it.disabled
                  ? "text-muted-foreground opacity-50"
                  : "cursor-pointer hover:bg-accent hover:text-accent-foreground",
                selected && "font-medium text-foreground"
              )}
              role="option"
              aria-selected={selected}
              onClick={() => {
                if (it.disabled) return
                onValueKeyChange(it.key)
              }}
            >
              {it.label}
            </div>
          )
        })}
        <div style={{ height: padPx }} />
      </div>

      {/* 中间选中高亮条：放在 column 内部，确保对齐 */}
      <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2">
        <div className="h-9 rounded-md bg-accent/40 ring-1 ring-accent" />
      </div>
    </div>
  )
}
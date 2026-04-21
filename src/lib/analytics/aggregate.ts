import type {
  PageViewRecord, AnalyticsSession, AnalyticsSummary, AnalyticsTimeSeries,
} from "@/types"

type Period = "today" | "7d" | "30d"

export function getPeriodRange(period: Period): { from: Date; to: Date } {
  const to = new Date()
  const from = new Date()
  if (period === "today") {
    from.setHours(0, 0, 0, 0)
  } else if (period === "7d") {
    from.setDate(from.getDate() - 7)
    from.setHours(0, 0, 0, 0)
  } else {
    from.setDate(from.getDate() - 30)
    from.setHours(0, 0, 0, 0)
  }
  return { from, to }
}

function top<T>(
  map: Map<string, T[]>,
  getValue: (items: T[]) => number,
  limit = 10
): { key: string; count: number }[] {
  return [...map.entries()]
    .map(([key, items]) => ({ key, count: getValue(items) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

function pct(n: number, total: number) {
  return total === 0 ? 0 : Math.round((n / total) * 1000) / 10
}

export function parseUA(ua: string): {
  device: "desktop" | "mobile" | "tablet"
  browser: string
  os: string
} {
  const low = ua.toLowerCase()
  const device: "desktop" | "mobile" | "tablet" =
    /ipad|tablet|(android(?!.*mobile))/i.test(ua)
      ? "tablet"
      : /mobile|android|iphone|ipod/i.test(ua)
      ? "mobile"
      : "desktop"

  const browser =
    /edg\//i.test(ua) ? "Edge"
    : /opr\//i.test(ua) ? "Opera"
    : /chrome\//i.test(ua) ? "Chrome"
    : /firefox\//i.test(ua) ? "Firefox"
    : /safari\//i.test(ua) ? "Safari"
    : "Other"

  const os =
    /windows/i.test(ua) ? "Windows"
    : /android/i.test(ua) ? "Android"
    : /iphone|ipad|ios/i.test(ua) ? "iOS"
    : /mac os/i.test(ua) ? "macOS"
    : /linux/i.test(ua) ? "Linux"
    : "Other"

  return { device, browser, os }
}

export function buildTimeSeries(
  views: PageViewRecord[],
  period: Period
): AnalyticsTimeSeries[] {
  const buckets = new Map<string, { sessions: Set<string>; views: number }>()

  const fmt =
    period === "today"
      ? (ts: string) => {
          const d = new Date(ts)
          return `${d.getHours().toString().padStart(2, "0")}:00`
        }
      : (ts: string) => {
          const d = new Date(ts)
          return `${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getDate().toString().padStart(2, "0")}`
        }

  // Pre-populate buckets so gaps show 0
  const { from, to } = getPeriodRange(period)
  if (period === "today") {
    for (let h = 0; h <= new Date().getHours(); h++) {
      buckets.set(`${h.toString().padStart(2, "0")}:00`, { sessions: new Set(), views: 0 })
    }
  } else {
    const days = period === "7d" ? 7 : 30
    for (let i = days; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const label = `${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getDate().toString().padStart(2, "0")}`
      buckets.set(label, { sessions: new Set(), views: 0 })
    }
  }

  for (const pv of views) {
    const label = fmt(pv.timestamp)
    const bucket = buckets.get(label) ?? { sessions: new Set(), views: 0 }
    bucket.sessions.add(pv.sessionId)
    bucket.views += 1
    buckets.set(label, bucket)
  }

  return [...buckets.entries()].map(([label, b]) => ({
    label,
    visitors: b.sessions.size,
    views: b.views,
  }))
}

export function buildSummary(
  views: PageViewRecord[],
  sessions: AnalyticsSession[],
  activeVisitors: number,
  period: Period
): AnalyticsSummary {
  const totalViews = views.length
  const uniqueVisitors = new Set(views.map((v) => v.sessionId)).size

  // Bounce rate: sessions that only have 1 page view
  const sessionPageCounts = new Map<string, number>()
  for (const v of views) {
    sessionPageCounts.set(v.sessionId, (sessionPageCounts.get(v.sessionId) ?? 0) + 1)
  }
  const totalSessions = sessionPageCounts.size
  const bouncedSessions = [...sessionPageCounts.values()].filter((c) => c === 1).length
  const bounceRate = totalSessions === 0 ? 0 : Math.round((bouncedSessions / totalSessions) * 1000) / 10

  // Avg duration
  const durViews = views.filter((v) => v.duration != null && v.duration > 0)
  const avgDuration =
    durViews.length === 0
      ? 0
      : Math.round(durViews.reduce((s, v) => s + (v.duration ?? 0), 0) / durViews.length)

  // Top pages
  const pageMap = new Map<string, number>()
  for (const v of views) pageMap.set(v.pathname, (pageMap.get(v.pathname) ?? 0) + 1)
  const topPages = [...pageMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([pathname, count]) => ({ pathname, views: count, pct: pct(count, totalViews) }))

  // Top referrers
  const refMap = new Map<string, number>()
  for (const v of views) {
    const ref = v.referrer
      ? (() => { try { return new URL(v.referrer).hostname } catch { return v.referrer } })()
      : "Direct"
    refMap.set(ref, (refMap.get(ref) ?? 0) + 1)
  }
  const topReferrers = [...refMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([referrer, visits]) => ({ referrer, visits, pct: pct(visits, totalViews) }))

  // Device breakdown
  const devMap = new Map<string, number>()
  for (const v of views) devMap.set(v.device, (devMap.get(v.device) ?? 0) + 1)
  const deviceBreakdown = [...devMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([label, count]) => ({ label, count, pct: pct(count, totalViews) }))

  // Browser breakdown
  const brMap = new Map<string, number>()
  for (const v of views) brMap.set(v.browser, (brMap.get(v.browser) ?? 0) + 1)
  const browserBreakdown = [...brMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([label, count]) => ({ label, count, pct: pct(count, totalViews) }))

  const timeSeries = buildTimeSeries(views, period)

  return {
    uniqueVisitors,
    pageViews: totalViews,
    bounceRate,
    avgDuration,
    activeVisitors,
    topPages,
    topReferrers,
    deviceBreakdown,
    browserBreakdown,
    timeSeries,
  }
}

export function fmtDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s}s`
}

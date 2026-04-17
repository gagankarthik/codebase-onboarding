"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  GitBranch,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  Bell,
  LogOut,
  Menu,
} from "lucide-react"
import { useTheme } from "next-themes"
import { toast } from "sonner"
import { cn, getInitials } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { useEffect } from "react"

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/repos", label: "Repositories", icon: GitBranch },
  { href: "/onboarding", label: "Onboardings", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
]

function NavItem({
  href,
  label,
  icon: Icon,
  active,
  collapsed,
}: {
  href: string
  label: string
  icon: typeof LayoutDashboard
  active: boolean
  collapsed: boolean
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
        active
          ? "border-l-2 border-sidebar-accent bg-white/10 text-white"
          : "border-l-2 border-transparent text-sidebar-foreground hover:bg-white/5 hover:text-white"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span>{label}</span>}
    </Link>
  )
}

function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<{ name: string; email: string; avatar?: string } | null>(null)

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d: { user?: { name: string; email: string; avatar: string } | null }) => {
        if (d.user) setUser(d.user)
      })
      .catch(() => {})
  }, [])

  async function handleSignOut() {
    try {
      await fetch("/api/auth/signout", { method: "POST" })
      router.push("/sign-in")
    } catch {
      toast.error("Sign-out failed — please try again.")
    }
  }

  const initials = user?.name ? getInitials(user.name) : "?"

  return (
    <div
      className={cn(
        "flex h-full flex-col bg-sidebar transition-all duration-200",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-sidebar-accent">
              <span className="text-xs font-bold text-white">C</span>
            </div>
            <span className="text-sm font-semibold text-white">Codebase Onboarding</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="ml-auto flex h-7 w-7 items-center justify-center rounded-md text-sidebar-foreground hover:bg-white/10 hover:text-white"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.href}
            {...item}
            active={pathname === item.href || pathname.startsWith(item.href + "/")}
            collapsed={collapsed}
          />
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-sidebar-border p-3">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-xs font-bold text-white">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-white">{user?.name ?? "Loading..."}</p>
              <p className="truncate text-xs text-sidebar-foreground">{user?.email ?? ""}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="text-sidebar-foreground hover:text-white"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              onClick={handleSignOut}
              className="text-sidebar-foreground hover:text-white"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function TopBar({ title }: { title?: string }) {
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()

  const currentPage = NAV_ITEMS.find(
    (n) => pathname === n.href || pathname.startsWith(n.href + "/")
  )

  return (
    <div className="flex h-14 items-center justify-between border-b border-border bg-background px-6">
      <div className="flex items-center gap-2 text-sm text-foreground-muted">
        <span className="text-foreground font-medium">{currentPage?.label ?? title ?? "Dashboard"}</span>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-svh overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0 bg-sidebar border-sidebar-border">
          <Sidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex h-14 items-center border-b border-border bg-background px-4 lg:px-6">
          <button
            onClick={() => setMobileOpen(true)}
            className="mr-3 text-foreground-muted hover:text-foreground lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <TopBar />
        </div>
        <main className="flex-1 overflow-y-auto bg-background-subtle">
          <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">{children}</div>
        </main>
      </div>
    </div>
  )
}

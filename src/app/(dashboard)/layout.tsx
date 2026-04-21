"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  GitBranch,
  Users,
  Settings,
  Shield,
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

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/repos", label: "Repositories", icon: GitBranch },
  { href: "/onboarding", label: "Onboardings", icon: Users },
  { href: "/security", label: "Security", icon: Shield },
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
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "border-l-2 border-primary bg-primary-subtle text-primary"
          : "border-l-2 border-transparent text-sidebar-foreground hover:bg-sidebar-border/40 hover:text-foreground"
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
        "flex h-full flex-col bg-sidebar border-r border-sidebar-border transition-all duration-200",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-4">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg"
              style={{ background: "oklch(0.546 0.243 264.4)" }}
            >
              <GitBranch className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-foreground">Codebase</span>
          </div>
        )}
        {collapsed && (
          <div
            className="mx-auto flex h-7 w-7 items-center justify-center rounded-lg"
            style={{ background: "oklch(0.546 0.243 264.4)" }}
          >
            <GitBranch className="h-3.5 w-3.5 text-white" />
          </div>
        )}
        {!collapsed && (
          <button
            onClick={onToggle}
            className="flex h-6 w-6 items-center justify-center rounded-md text-foreground-muted hover:bg-sidebar-border/40 hover:text-foreground"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
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

      {collapsed && (
        <div className="flex justify-center py-2 border-t border-sidebar-border">
          <button
            onClick={onToggle}
            className="flex h-7 w-7 items-center justify-center rounded-md text-foreground-muted hover:bg-sidebar-border/40 hover:text-foreground"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* User */}
      <div className="border-t border-sidebar-border p-3">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ background: "oklch(0.546 0.243 264.4)" }}
            >
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-foreground">{user?.name ?? "Loading..."}</p>
              <p className="truncate text-xs text-sidebar-foreground">{user?.email ?? ""}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="shrink-0 text-foreground-muted hover:text-foreground"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white cursor-pointer"
              style={{ background: "oklch(0.546 0.243 264.4)" }}
              onClick={handleSignOut}
              title="Sign out"
            >
              {initials}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function TopBar() {
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()

  const currentPage = NAV_ITEMS.find(
    (n) => pathname === n.href || pathname.startsWith(n.href + "/")
  )

  return (
    <div className="flex flex-1 items-center justify-between">
      <span className="text-sm font-semibold text-foreground">
        {currentPage?.label ?? "Dashboard"}
      </span>
      <div className="flex items-center gap-1">
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

import { Link, useLocation } from 'react-router-dom'
import { Home, BarChart3, Table2, Settings, BookOpen, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
  badge?: string
  badgeVariant?: 'default' | 'success' | 'warning' | 'error'
}

const navItems: NavItem[] = [
  {
    title: 'Monitor',
    href: '/',
    icon: <Home className="h-4 w-4" />,
    badge: 'Live',
    badgeVariant: 'success',
  },
  {
    title: 'Qualidade',
    href: '/quality',
    icon: <BarChart3 className="h-4 w-4" />,
    badge: '94%',
    badgeVariant: 'success',
  },
  {
    title: 'Dados',
    href: '/data-table',
    icon: <Table2 className="h-4 w-4" />,
  },
  {
    title: 'Configurações',
    href: '/settings',
    icon: <Settings className="h-4 w-4" />,
  },
  {
    title: 'Documentação',
    href: '/docs',
    icon: <BookOpen className="h-4 w-4" />,
  },
]

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const location = useLocation()

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 border-r bg-background transition-transform md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Close button (mobile) */}
        <div className="flex items-center justify-between p-4 md:hidden">
          <h2 className="text-lg font-semibold">Menu</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
            <span className="sr-only">Close menu</span>
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 p-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => onClose?.()}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                location.pathname === item.href && 'bg-accent text-accent-foreground'
              )}
            >
              {item.icon}
              <span className="flex-1">{item.title}</span>
              {item.badge && (
                <Badge variant={item.badgeVariant} className="ml-auto">
                  {item.badge}
                </Badge>
              )}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 border-t p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <span className="text-sm font-medium">U</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Usuário</p>
              <p className="text-xs text-muted-foreground">user@techdengue.com</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

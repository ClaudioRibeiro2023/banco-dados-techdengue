'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Bug } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { mainNavigation, settingsNavigation, type NavItem } from '@/config/navigation';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface SidebarProps {
  isCollapsed?: boolean;
}

function NavItemComponent({ item, isCollapsed }: { item: NavItem; isCollapsed: boolean }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
  const hasChildren = item.children && item.children.length > 0;
  const Icon = item.icon;

  if (hasChildren) {
    return (
      <div>
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start gap-3',
            isActive && 'bg-primary/10 text-primary',
            isCollapsed && 'justify-center px-2'
          )}
          onClick={() => setIsOpen(!isOpen)}
        >
          <Icon className="h-5 w-5" />
          {!isCollapsed && (
            <>
              <span className="flex-1 text-left">{item.title}</span>
              <ChevronDown
                className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')}
              />
            </>
          )}
        </Button>
        {!isCollapsed && isOpen && (
          <div className="ml-6 mt-1 space-y-1">
            {item.children!.map((child) => (
              <Link key={child.href} href={child.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'w-full justify-start',
                    pathname === child.href && 'bg-primary/10 text-primary'
                  )}
                >
                  {child.title}
                </Button>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link href={item.href}>
      <Button
        variant="ghost"
        className={cn(
          'w-full justify-start gap-3',
          isActive && 'bg-primary/10 text-primary',
          isCollapsed && 'justify-center px-2'
        )}
      >
        <Icon className="h-5 w-5" />
        {!isCollapsed && <span>{item.title}</span>}
        {!isCollapsed && item.badge && (
          <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
            {item.badge}
          </span>
        )}
      </Button>
    </Link>
  );
}

export function Sidebar({ isCollapsed = false }: SidebarProps) {
  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r bg-card transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b px-4">
        <Bug className="h-8 w-8 text-primary" />
        {!isCollapsed && (
          <div className="flex flex-col">
            <span className="font-bold text-primary">TechDengue</span>
            <span className="text-xs text-muted-foreground">Dashboard</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {mainNavigation.map((item) => (
            <NavItemComponent key={item.href} item={item} isCollapsed={isCollapsed} />
          ))}
        </nav>

        <Separator className="my-4" />

        <nav className="space-y-1">
          {settingsNavigation.map((item) => (
            <NavItemComponent key={item.href} item={item} isCollapsed={isCollapsed} />
          ))}
        </nav>
      </ScrollArea>

      {/* Footer */}
      {!isCollapsed && (
        <div className="border-t p-4">
          <p className="text-xs text-muted-foreground">© 2024 TechDengue</p>
        </div>
      )}
    </aside>
  );
}

'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { FileText, Building2, Calendar, FileCheck, BarChart3, History } from 'lucide-react';
import { cn } from '@/lib/utils';

const relatoriosNavItems = [
  { title: 'Gerador', href: '/relatorios', icon: FileText },
  { title: 'Municipal', href: '/relatorios/municipal', icon: Building2 },
  { title: 'Atividades', href: '/relatorios/atividades', icon: Calendar },
  { title: 'Devolutivas', href: '/relatorios/devolutivas', icon: FileCheck },
  { title: 'Executivo', href: '/relatorios/executivo', icon: BarChart3 },
  { title: 'Histórico', href: '/relatorios/historico', icon: History },
];

export default function RelatoriosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Relatórios</h1>
        <p className="text-muted-foreground">
          Gere e exporte relatórios detalhados
        </p>
      </div>

      <nav className="flex space-x-1 border-b">
        {relatoriosNavItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/relatorios' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px',
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.title}
            </Link>
          );
        })}
      </nav>

      {children}
    </div>
  );
}

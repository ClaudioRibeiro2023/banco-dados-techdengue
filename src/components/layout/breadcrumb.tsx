'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

const routeNames: Record<string, string> = {
  dashboard: 'Dashboard',
  mapa: 'Mapa',
  analise: 'Análises',
  criadouros: 'Criadouros',
  devolutivas: 'Devolutivas',
  comparativo: 'Comparativo',
  correlacao: 'Correlação',
  atividades: 'Atividades',
  relatorios: 'Relatórios',
  configuracoes: 'Configurações',
};

export function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav className="flex items-center gap-1 text-sm text-muted-foreground">
      <Link href="/dashboard" className="flex items-center hover:text-foreground">
        <Home className="h-4 w-4" />
      </Link>

      {segments.map((segment, index) => {
        const href = '/' + segments.slice(0, index + 1).join('/');
        const isLast = index === segments.length - 1;
        const name = routeNames[segment] || segment;

        return (
          <div key={href} className="flex items-center">
            <ChevronRight className="h-4 w-4" />
            {isLast ? (
              <span className={cn('ml-1 font-medium text-foreground')}>{name}</span>
            ) : (
              <Link href={href} className="ml-1 hover:text-foreground">
                {name}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}

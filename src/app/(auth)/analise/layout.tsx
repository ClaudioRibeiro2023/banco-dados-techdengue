'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Bug, FileCheck, GitCompare, BarChart3, CloudSun } from 'lucide-react';
import { cn } from '@/lib/utils';

const analysisNavItems = [
  {
    title: 'Criadouros',
    href: '/analise/criadouros',
    icon: Bug,
    description: 'Análise de tipos e distribuição',
  },
  {
    title: 'Devolutivas',
    href: '/analise/devolutivas',
    icon: FileCheck,
    description: 'Taxas e tempo de resposta',
  },
  {
    title: 'Comparativo',
    href: '/analise/comparativo',
    icon: GitCompare,
    description: 'Comparação entre municípios',
  },
  {
    title: 'Correlação Climática',
    href: '/analise/correlacao',
    icon: CloudSun,
    description: 'Clima x criadouros',
  },
];

export default function AnaliseLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BarChart3 className="h-8 w-8" />
          Análises
        </h1>
        <p className="text-muted-foreground mt-1">
          Explore dados detalhados sobre criadouros, devolutivas e performance
        </p>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex gap-1 border-b">
        {analysisNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-[2px]',
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

      {/* Content */}
      <div className="flex-1">{children}</div>
    </div>
  );
}

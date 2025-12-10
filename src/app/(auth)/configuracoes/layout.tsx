'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { User, Shield, Bell, Palette, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const configuracoesNavItems = [
  { title: 'Perfil', href: '/configuracoes', icon: User, description: 'Suas informações pessoais' },
  { title: 'Segurança', href: '/configuracoes/seguranca', icon: Shield, description: 'Senha e autenticação' },
  { title: 'Notificações', href: '/configuracoes/notificacoes', icon: Bell, description: 'Preferências de alertas' },
  { title: 'Aparência', href: '/configuracoes/aparencia', icon: Palette, description: 'Tema e visual' },
];

export default function ConfiguracoesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie suas preferências e configurações de conta
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar de navegação */}
        <nav className="lg:w-64 flex-shrink-0">
          <div className="space-y-1">
            {configuracoesNavItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/configuracoes' && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <div>
                    <p className="font-medium text-sm">{item.title}</p>
                    <p className={cn(
                      'text-xs',
                      isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'
                    )}>
                      {item.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Conteúdo principal */}
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}

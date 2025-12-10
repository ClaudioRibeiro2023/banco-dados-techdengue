'use client';

import { useState, type ReactNode } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { AuthGuard } from '@/features/auth/components/auth-guard';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { SkipLink } from '@/components/accessibility';

export default function AuthLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <AuthGuard>
      <SkipLink href="#main-content" />
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Sidebar Desktop */}
        <aside className="hidden lg:block" aria-label="Navegação principal">
          <Sidebar isCollapsed={isCollapsed} />
        </aside>

        {/* Sidebar Mobile */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-64 p-0" aria-label="Menu de navegação">
            <Sidebar />
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header
            onMenuClick={() => setSidebarOpen(true)}
          />

          <main
            id="main-content"
            className="flex-1 overflow-auto"
            role="main"
            aria-label="Conteúdo principal"
          >
            <div className="container mx-auto p-6">
              <nav aria-label="Breadcrumb" className="mb-6">
                <Breadcrumb />
              </nav>
              {children}
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}

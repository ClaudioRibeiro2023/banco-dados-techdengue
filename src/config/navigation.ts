import {
  LayoutDashboard,
  Map,
  BarChart3,
  Calendar,
  FileText,
  Settings,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  children?: NavItem[];
}

export const mainNavigation: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Mapa',
    href: '/mapa',
    icon: Map,
  },
  {
    title: 'Análises',
    href: '/analise',
    icon: BarChart3,
    children: [
      { title: 'Criadouros', href: '/analise/criadouros', icon: BarChart3 },
      { title: 'Devolutivas', href: '/analise/devolutivas', icon: BarChart3 },
      { title: 'Comparativo', href: '/analise/comparativo', icon: BarChart3 },
      { title: 'Correlação', href: '/analise/correlacao', icon: BarChart3 },
    ],
  },
  {
    title: 'Atividades',
    href: '/atividades',
    icon: Calendar,
  },
  {
    title: 'Relatórios',
    href: '/relatorios',
    icon: FileText,
  },
];

export const settingsNavigation: NavItem[] = [
  {
    title: 'Configurações',
    href: '/configuracoes',
    icon: Settings,
  },
];

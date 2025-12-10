'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Calendar,
  MapPin,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DashboardFilters } from '@/features/dashboard/components/dashboard-filters';
import type { Atividade } from '@/types/api.types';

const STATUS_LABELS: Record<string, string> = {
  planejada: 'Planejada',
  em_andamento: 'Em Andamento',
  concluida: 'Concluída',
  cancelada: 'Cancelada',
};

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  planejada: 'outline',
  em_andamento: 'secondary',
  concluida: 'default',
  cancelada: 'destructive',
};

// Mock data
const mockAtividades: Atividade[] = [
  {
    id: '1',
    municipio_id: '1',
    contrato_id: '1',
    piloto_id: '1',
    data_atividade: '2024-12-05',
    turno: 'manha',
    hectares_mapeados: 245,
    hectares_efetivos: 220,
    status: 'concluida',
    observacoes: 'Mapeamento setor Norte',
    created_at: '',
    updated_at: '',
  },
  {
    id: '2',
    municipio_id: '1',
    contrato_id: '1',
    piloto_id: '2',
    data_atividade: '2024-12-05',
    turno: 'tarde',
    hectares_mapeados: 180,
    hectares_efetivos: 165,
    status: 'concluida',
    created_at: '',
    updated_at: '',
  },
  {
    id: '3',
    municipio_id: '1',
    contrato_id: '1',
    piloto_id: '1',
    data_atividade: '2024-12-08',
    turno: 'manha',
    hectares_mapeados: 300,
    hectares_efetivos: 285,
    status: 'concluida',
    created_at: '',
    updated_at: '',
  },
  {
    id: '4',
    municipio_id: '1',
    contrato_id: '1',
    piloto_id: '3',
    data_atividade: '2024-12-12',
    turno: 'manha',
    hectares_mapeados: 150,
    hectares_efetivos: 0,
    status: 'em_andamento',
    observacoes: 'Em execução - setor Sul',
    created_at: '',
    updated_at: '',
  },
  {
    id: '5',
    municipio_id: '1',
    contrato_id: '1',
    piloto_id: '2',
    data_atividade: '2024-12-15',
    turno: 'manha',
    hectares_mapeados: 200,
    hectares_efetivos: 0,
    status: 'planejada',
    observacoes: 'Área industrial',
    created_at: '',
    updated_at: '',
  },
  {
    id: '6',
    municipio_id: '1',
    contrato_id: '1',
    piloto_id: '1',
    data_atividade: '2024-12-15',
    turno: 'tarde',
    hectares_mapeados: 175,
    hectares_efetivos: 0,
    status: 'planejada',
    created_at: '',
    updated_at: '',
  },
  {
    id: '7',
    municipio_id: '1',
    contrato_id: '1',
    piloto_id: '3',
    data_atividade: '2024-12-18',
    turno: 'manha',
    hectares_mapeados: 250,
    hectares_efetivos: 0,
    status: 'planejada',
    created_at: '',
    updated_at: '',
  },
  {
    id: '8',
    municipio_id: '1',
    contrato_id: '1',
    piloto_id: '2',
    data_atividade: '2024-12-03',
    turno: 'manha',
    hectares_mapeados: 120,
    hectares_efetivos: 0,
    status: 'cancelada',
    observacoes: 'Cancelada por condições climáticas',
    created_at: '',
    updated_at: '',
  },
];

const PILOTOS: Record<string, string> = {
  '1': 'João Silva',
  '2': 'Maria Santos',
  '3': 'Carlos Oliveira',
};

export default function ListaAtividadesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [turnoFilter, setTurnoFilter] = useState<string>('all');

  const filteredAtividades = mockAtividades.filter((atividade) => {
    const matchesSearch =
      PILOTOS[atividade.piloto_id]?.toLowerCase().includes(search.toLowerCase()) ||
      atividade.observacoes?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || atividade.status === statusFilter;
    const matchesTurno = turnoFilter === 'all' || atividade.turno === turnoFilter;
    return matchesSearch && matchesStatus && matchesTurno;
  });

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex justify-end">
        <DashboardFilters />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="text-base">Lista de Atividades</CardTitle>
            <Button>Nova Atividade</Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtros da tabela */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por piloto ou observação..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="planejada">Planejada</SelectItem>
                <SelectItem value="em_andamento">Em Andamento</SelectItem>
                <SelectItem value="concluida">Concluída</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
            <Select value={turnoFilter} onValueChange={setTurnoFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Turno" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="manha">Manhã</SelectItem>
                <SelectItem value="tarde">Tarde</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabela */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Data</th>
                  <th className="text-left py-3 px-4 font-medium">Piloto</th>
                  <th className="text-left py-3 px-4 font-medium">Turno</th>
                  <th className="text-right py-3 px-4 font-medium">Hectares</th>
                  <th className="text-right py-3 px-4 font-medium">Efetivos</th>
                  <th className="text-center py-3 px-4 font-medium">Status</th>
                  <th className="text-right py-3 px-4 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredAtividades.map((atividade) => (
                  <tr key={atividade.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {format(new Date(atividade.data_atividade), 'dd/MM/yyyy', {
                          locale: ptBR,
                        })}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {PILOTOS[atividade.piloto_id] || `Piloto ${atividade.piloto_id}`}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">
                        {atividade.turno === 'manha' ? 'Manhã' : 'Tarde'}
                      </Badge>
                    </td>
                    <td className="text-right py-3 px-4">
                      {atividade.hectares_mapeados.toLocaleString('pt-BR')}
                    </td>
                    <td className="text-right py-3 px-4">
                      {atividade.hectares_efetivos > 0 ? (
                        <span className="text-emerald-600 font-medium">
                          {atividade.hectares_efetivos.toLocaleString('pt-BR')}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="text-center py-3 px-4">
                      <Badge variant={STATUS_VARIANTS[atividade.status]}>
                        {STATUS_LABELS[atividade.status]}
                      </Badge>
                    </td>
                    <td className="text-right py-3 px-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            Visualizar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredAtividades.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma atividade encontrada com os filtros selecionados</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

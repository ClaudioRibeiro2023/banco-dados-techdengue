'use client';

import { useState } from 'react';
import {
  History,
  FileText,
  Download,
  Trash2,
  Search,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  FileSpreadsheet,
  Eye,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { EmptyState } from '@/components/feedback/empty-state';
import {
  useRelatoriosHistoricoStore,
  getTipoRelatorioLabel,
  getFormatoLabel,
  formatFileSize,
  type TipoRelatorio,
  type RelatorioHistorico,
} from '@/stores/relatorios-historico.store';

export default function HistoricoRelatoriosPage() {
  const { historico, removeRelatorio, clearHistorico } = useRelatoriosHistoricoStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState<TipoRelatorio | 'todos'>('todos');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'concluido' | 'erro' | 'processando'>('todos');

  // Filter historico
  const filteredHistorico = historico.filter((rel) => {
    const matchesSearch =
      rel.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getTipoRelatorioLabel(rel.tipo).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = tipoFilter === 'todos' || rel.tipo === tipoFilter;
    const matchesStatus = statusFilter === 'todos' || rel.status === statusFilter;
    return matchesSearch && matchesTipo && matchesStatus;
  });

  const getStatusBadge = (status: RelatorioHistorico['status']) => {
    switch (status) {
      case 'concluido':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="mr-1 h-3 w-3" />
            Concluído
          </Badge>
        );
      case 'erro':
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            Erro
          </Badge>
        );
      case 'processando':
        return (
          <Badge variant="secondary">
            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            Processando
          </Badge>
        );
    }
  };

  const getFormatoIcon = (formato: RelatorioHistorico['formato']) => {
    switch (formato) {
      case 'pdf':
        return <FileText className="h-4 w-4 text-red-500" />;
      case 'excel':
        return <FileSpreadsheet className="h-4 w-4 text-green-600" />;
      case 'preview':
        return <Eye className="h-4 w-4 text-blue-500" />;
    }
  };

  const handleDownload = (relatorio: RelatorioHistorico) => {
    if (relatorio.downloadUrl) {
      window.open(relatorio.downloadUrl, '_blank');
    }
  };

  const handleRetry = (relatorio: RelatorioHistorico) => {
    // Redirecionar para a página do relatório com os filtros
    const params = new URLSearchParams();
    if (relatorio.filtros.municipio) params.set('municipio', relatorio.filtros.municipio);
    if (relatorio.filtros.dataInicio) params.set('dataInicio', relatorio.filtros.dataInicio);
    if (relatorio.filtros.dataFim) params.set('dataFim', relatorio.filtros.dataFim);

    window.location.href = `/relatorios/${relatorio.tipo}?${params.toString()}`;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <History className="h-6 w-6" />
            Histórico de Relatórios
          </h1>
          <p className="text-muted-foreground">
            Visualize e gerencie seus relatórios exportados
          </p>
        </div>

        {historico.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Limpar Histórico
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Limpar histórico?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação irá remover todos os {historico.length} relatórios do histórico.
                  Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={clearHistorico}
                  className="bg-destructive text-destructive-foreground"
                >
                  Limpar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{historico.length}</p>
                <p className="text-xs text-muted-foreground">Total de relatórios</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {historico.filter((r) => r.status === 'concluido').length}
                </p>
                <p className="text-xs text-muted-foreground">Concluídos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {historico.filter((r) => r.status === 'erro').length}
                </p>
                <p className="text-xs text-muted-foreground">Com erro</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {historico.filter((r) => r.status === 'processando').length}
                </p>
                <p className="text-xs text-muted-foreground">Processando</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar relatório..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex gap-2">
              <Select value={tipoFilter} onValueChange={(v) => setTipoFilter(v as typeof tipoFilter)}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os tipos</SelectItem>
                  <SelectItem value="municipal">Municipal</SelectItem>
                  <SelectItem value="atividades">Atividades</SelectItem>
                  <SelectItem value="devolutivas">Devolutivas</SelectItem>
                  <SelectItem value="executivo">Executivo</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                  <SelectItem value="erro">Com erro</SelectItem>
                  <SelectItem value="processando">Processando</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {filteredHistorico.length === 0 ? (
            <div className="p-8">
              <EmptyState
                type="reports"
                title={historico.length === 0 ? 'Nenhum relatório no histórico' : 'Nenhum resultado encontrado'}
                description={
                  historico.length === 0
                    ? 'Quando você exportar relatórios, eles aparecerão aqui.'
                    : 'Tente ajustar os filtros de busca.'
                }
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Relatório</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Formato</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Tamanho</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistorico.map((relatorio) => (
                  <TableRow key={relatorio.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getFormatoIcon(relatorio.formato)}
                        <div>
                          <p className="font-medium">{relatorio.titulo}</p>
                          {relatorio.filtros.municipio && (
                            <p className="text-xs text-muted-foreground">
                              {relatorio.filtros.municipio}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getTipoRelatorioLabel(relatorio.tipo)}
                      </Badge>
                    </TableCell>
                    <TableCell>{getFormatoLabel(relatorio.formato)}</TableCell>
                    <TableCell>
                      <span title={new Date(relatorio.dataCriacao).toLocaleString('pt-BR')}>
                        {formatDistanceToNow(new Date(relatorio.dataCriacao), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </span>
                    </TableCell>
                    <TableCell>{formatFileSize(relatorio.tamanho)}</TableCell>
                    <TableCell>{getStatusBadge(relatorio.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            ...
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {relatorio.status === 'concluido' && relatorio.downloadUrl && (
                            <DropdownMenuItem onClick={() => handleDownload(relatorio)}>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                          )}
                          {relatorio.status === 'erro' && (
                            <DropdownMenuItem onClick={() => handleRetry(relatorio)}>
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Tentar novamente
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => removeRelatorio(relatorio.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remover
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useQuery } from '@tanstack/react-query';
import { RefreshCw, Filter, X } from 'lucide-react';
import { type DateRange } from 'react-day-picker';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { DateRangePicker } from '@/components/forms/date-range-picker';
import { MunicipioSelect } from '@/components/forms/municipio-select';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useFilterStore } from '@/stores/filter.store';
import { dadosGeograficosService } from '@/lib/services';

export function DashboardFilters() {
  const { municipioId, contratoId, dateRange, setMunicipio, setContrato, setDateRange, resetFilters } = useFilterStore();
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Query para buscar municípios
  const { data: municipios = [], isLoading: isLoadingMunicipios } = useQuery({
    queryKey: ['municipios'],
    queryFn: () => dadosGeograficosService.getMunicipios(),
    staleTime: 60 * 60 * 1000, // 1 hora
  });

  // Query para buscar contratos baseado no município selecionado
  const { data: contratos = [], isLoading: isLoadingContratos } = useQuery({
    queryKey: ['contratos', municipioId],
    queryFn: () => dadosGeograficosService.getContratos(municipioId || undefined),
    staleTime: 30 * 60 * 1000, // 30 minutos
  });

  const municipioOptions = municipios.map((m) => ({
    value: m.codigo_ibge || m.id || '',
    label: m.nome_municipio || m.nome || '',
  }));

  const contratoOptions = contratos.map((c) => ({
    value: c.id,
    label: `${c.numero} (${c.status})`,
  }));

  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      setDateRange({ from: range.from, to: range.to });
    }
  };

  const handleMunicipioChange = (value: string | null) => {
    setMunicipio(value);
    // Limpa contrato quando município muda
    setContrato(null);
  };

  const handleReset = () => {
    resetFilters();
    setShowAdvanced(false);
  };

  // Conta filtros ativos
  const activeFiltersCount = [municipioId, contratoId].filter(Boolean).length;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Filtros principais sempre visíveis */}
      <MunicipioSelect
        value={municipioId || ''}
        onChange={handleMunicipioChange}
        options={municipioOptions}
        placeholder="Todos os municípios"
        disabled={isLoadingMunicipios}
        className="w-[200px]"
      />

      <DateRangePicker
        value={{ from: dateRange.from, to: dateRange.to }}
        onChange={handleDateRangeChange}
      />

      {/* Filtros avançados em popover */}
      <Popover open={showAdvanced} onOpenChange={setShowAdvanced}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Filtros
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Filtros Avançados</h4>
              {activeFiltersCount > 0 && (
                <Button variant="ghost" size="sm" onClick={handleReset} className="h-auto p-1 text-xs">
                  Limpar tudo
                </Button>
              )}
            </div>

            {/* Filtro de Contrato */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Contrato</label>
              <Select
                value={contratoId || ''}
                onValueChange={(v) => setContrato(v || null)}
                disabled={isLoadingContratos || !municipioId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={municipioId ? "Selecione um contrato" : "Selecione município primeiro"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os contratos</SelectItem>
                  {contratoOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtros ativos como badges */}
            {activeFiltersCount > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Filtros ativos</label>
                <div className="flex flex-wrap gap-2">
                  {municipioId && (
                    <Badge variant="secondary" className="gap-1">
                      {municipios.find(m => m.id === municipioId)?.nome || 'Município'}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-destructive"
                        onClick={() => handleMunicipioChange(null)}
                      />
                    </Badge>
                  )}
                  {contratoId && (
                    <Badge variant="secondary" className="gap-1">
                      {contratos.find(c => c.id === contratoId)?.numero || 'Contrato'}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-destructive"
                        onClick={() => setContrato(null)}
                      />
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Botão de reset rápido */}
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={handleReset} 
        title="Limpar filtros"
        className="h-9 w-9"
      >
        <RefreshCw className="h-4 w-4" />
      </Button>
    </div>
  );
}

'use client';

import { useState, useEffect, useMemo } from 'react';
import { Building2, ChevronDown, Check, Search, MapPin, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { useFilterStore } from '@/stores/filter.store';
import { cn } from '@/lib/utils';

export interface Contrato {
  id: string;
  nome: string;
  municipio: string;
  municipioId: string;
  status: 'ativo' | 'inativo' | 'suspenso';
  dataInicio: string;
  dataFim: string;
}

interface ContractSelectorProps {
  contratos?: Contrato[];
  onSelect?: (contrato: Contrato | null) => void;
  showMunicipio?: boolean;
  className?: string;
}

// Mock data for development
const mockContratos: Contrato[] = [
  {
    id: '1',
    nome: 'Contrato 001/2024',
    municipio: 'São Paulo',
    municipioId: 'sp',
    status: 'ativo',
    dataInicio: '2024-01-01',
    dataFim: '2024-12-31',
  },
  {
    id: '2',
    nome: 'Contrato 002/2024',
    municipio: 'Rio de Janeiro',
    municipioId: 'rj',
    status: 'ativo',
    dataInicio: '2024-02-01',
    dataFim: '2024-12-31',
  },
  {
    id: '3',
    nome: 'Contrato 003/2024',
    municipio: 'Belo Horizonte',
    municipioId: 'bh',
    status: 'ativo',
    dataInicio: '2024-03-01',
    dataFim: '2025-03-01',
  },
  {
    id: '4',
    nome: 'Contrato 001/2023',
    municipio: 'São Paulo',
    municipioId: 'sp',
    status: 'inativo',
    dataInicio: '2023-01-01',
    dataFim: '2023-12-31',
  },
  {
    id: '5',
    nome: 'Contrato 004/2024',
    municipio: 'Curitiba',
    municipioId: 'cwb',
    status: 'suspenso',
    dataInicio: '2024-01-15',
    dataFim: '2024-07-15',
  },
];

export function ContractSelector({
  contratos = mockContratos,
  onSelect,
  showMunicipio = true,
  className,
}: ContractSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const { contratoId, setContrato, setMunicipio } = useFilterStore();

  const selectedContrato = useMemo(
    () => contratos.find((c) => c.id === contratoId) || null,
    [contratos, contratoId]
  );

  // Group contracts by municipality
  const groupedContratos = useMemo(() => {
    const groups: Record<string, Contrato[]> = {};
    contratos.forEach((contrato) => {
      if (!groups[contrato.municipio]) {
        groups[contrato.municipio] = [];
      }
      groups[contrato.municipio].push(contrato);
    });
    return groups;
  }, [contratos]);

  // Filter contracts based on search
  const filteredGroups = useMemo(() => {
    if (!searchValue) return groupedContratos;

    const filtered: Record<string, Contrato[]> = {};
    const searchLower = searchValue.toLowerCase();

    Object.entries(groupedContratos).forEach(([municipio, contratosGroup]) => {
      const matchingContratos = contratosGroup.filter(
        (c) =>
          c.nome.toLowerCase().includes(searchLower) ||
          c.municipio.toLowerCase().includes(searchLower)
      );
      if (matchingContratos.length > 0) {
        filtered[municipio] = matchingContratos;
      }
    });

    return filtered;
  }, [groupedContratos, searchValue]);

  const handleSelect = (contrato: Contrato | null) => {
    if (contrato) {
      setContrato(contrato.id);
      if (showMunicipio) {
        setMunicipio(contrato.municipioId);
      }
    } else {
      setContrato(null);
      if (showMunicipio) {
        setMunicipio(null);
      }
    }
    onSelect?.(contrato);
    setOpen(false);
  };

  const getStatusColor = (status: Contrato['status']) => {
    switch (status) {
      case 'ativo':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inativo':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'suspenso':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: Contrato['status']) => {
    switch (status) {
      case 'ativo':
        return 'Ativo';
      case 'inativo':
        return 'Inativo';
      case 'suspenso':
        return 'Suspenso';
      default:
        return status;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Selecionar contrato"
          className={cn('justify-between min-w-[250px]', className)}
        >
          <div className="flex items-center gap-2 truncate">
            <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
            {selectedContrato ? (
              <div className="flex flex-col items-start">
                <span className="truncate">{selectedContrato.nome}</span>
                {showMunicipio && (
                  <span className="text-xs text-muted-foreground">
                    {selectedContrato.municipio}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-muted-foreground">Selecionar contrato...</span>
            )}
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Buscar contrato..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty>Nenhum contrato encontrado.</CommandEmpty>

            {/* Clear selection option */}
            {selectedContrato && (
              <>
                <CommandGroup>
                  <CommandItem
                    onSelect={() => handleSelect(null)}
                    className="text-muted-foreground"
                  >
                    Limpar seleção
                  </CommandItem>
                </CommandGroup>
                <CommandSeparator />
              </>
            )}

            {/* Grouped contracts */}
            {Object.entries(filteredGroups).map(([municipio, contratosGroup]) => (
              <CommandGroup key={municipio} heading={municipio}>
                {contratosGroup.map((contrato) => (
                  <CommandItem
                    key={contrato.id}
                    value={contrato.id}
                    onSelect={() => handleSelect(contrato)}
                    className="flex flex-col items-start gap-1 py-3"
                  >
                    <div className="flex w-full items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Check
                          className={cn(
                            'h-4 w-4',
                            selectedContrato?.id === contrato.id
                              ? 'opacity-100'
                              : 'opacity-0'
                          )}
                        />
                        <span className="font-medium">{contrato.nome}</span>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn('text-xs', getStatusColor(contrato.status))}
                      >
                        {getStatusLabel(contrato.status)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 pl-6 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {contrato.municipio}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(contrato.dataInicio)} - {formatDate(contrato.dataFim)}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Compact version for header
export function ContractSelectorCompact({
  contratos = mockContratos,
  onSelect,
  className,
}: Omit<ContractSelectorProps, 'showMunicipio'>) {
  const [open, setOpen] = useState(false);
  const { contratoId, setContrato, setMunicipio } = useFilterStore();

  const selectedContrato = useMemo(
    () => contratos.find((c) => c.id === contratoId) || null,
    [contratos, contratoId]
  );

  const handleSelect = (contrato: Contrato | null) => {
    if (contrato) {
      setContrato(contrato.id);
      setMunicipio(contrato.municipioId);
    } else {
      setContrato(null);
      setMunicipio(null);
    }
    onSelect?.(contrato);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          role="combobox"
          aria-expanded={open}
          aria-label="Selecionar contrato"
          className={cn('gap-1 h-8', className)}
        >
          <Building2 className="h-4 w-4" />
          <span className="hidden sm:inline-block max-w-[150px] truncate">
            {selectedContrato?.nome || 'Contrato'}
          </span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="end">
        <Command>
          <CommandInput placeholder="Buscar contrato..." />
          <CommandList>
            <CommandEmpty>Nenhum contrato encontrado.</CommandEmpty>
            {selectedContrato && (
              <>
                <CommandGroup>
                  <CommandItem
                    onSelect={() => handleSelect(null)}
                    className="text-muted-foreground"
                  >
                    Limpar seleção
                  </CommandItem>
                </CommandGroup>
                <CommandSeparator />
              </>
            )}
            <CommandGroup heading="Contratos Ativos">
              {contratos
                .filter((c) => c.status === 'ativo')
                .map((contrato) => (
                  <CommandItem
                    key={contrato.id}
                    value={contrato.id}
                    onSelect={() => handleSelect(contrato)}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        selectedContrato?.id === contrato.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <div className="flex flex-col">
                      <span>{contrato.nome}</span>
                      <span className="text-xs text-muted-foreground">
                        {contrato.municipio}
                      </span>
                    </div>
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

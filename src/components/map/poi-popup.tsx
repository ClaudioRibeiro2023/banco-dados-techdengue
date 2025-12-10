'use client';

import { Popup } from 'react-map-gl/mapbox';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MapPin, Calendar, AlertCircle, Eye, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface POIPopupProps {
  longitude: number;
  latitude: number;
  properties: {
    id: string;
    tipo_criadouro: string;
    status_devolutiva: string;
    data_identificacao: string;
    observacoes?: string;
    foto_url?: string;
  };
  onClose: () => void;
  onViewDetails?: (id: string) => void;
}

const STATUS_CONFIG = {
  pendente: {
    label: 'Pendente',
    color: 'bg-yellow-500',
    icon: AlertCircle,
  },
  em_analise: {
    label: 'Em Análise',
    color: 'bg-blue-500',
    icon: Eye,
  },
  tratado: {
    label: 'Tratado',
    color: 'bg-green-500',
    icon: CheckCircle2,
  },
  descartado: {
    label: 'Descartado',
    color: 'bg-gray-500',
    icon: XCircle,
  },
};

const TIPO_LABELS: Record<string, string> = {
  pneu: 'Pneu',
  caixa_dagua: 'Caixa d\'água',
  calha: 'Calha',
  piscina: 'Piscina',
  lixo: 'Lixo/Entulho',
  outros: 'Outros',
};

export function POIPopup({
  longitude,
  latitude,
  properties,
  onClose,
  onViewDetails,
}: POIPopupProps) {
  const statusConfig =
    STATUS_CONFIG[properties.status_devolutiva as keyof typeof STATUS_CONFIG] ||
    STATUS_CONFIG.pendente;
  const StatusIcon = statusConfig.icon;

  const formattedDate = properties.data_identificacao
    ? format(new Date(properties.data_identificacao), "dd 'de' MMMM 'de' yyyy", {
        locale: ptBR,
      })
    : 'Data não informada';

  return (
    <Popup
      longitude={longitude}
      latitude={latitude}
      anchor="bottom"
      onClose={onClose}
      closeButton={true}
      closeOnClick={false}
      className="poi-popup"
      maxWidth="300px"
    >
      <div className="p-2">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <h3 className="font-semibold text-sm">
              {TIPO_LABELS[properties.tipo_criadouro] || properties.tipo_criadouro}
            </h3>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <MapPin className="h-3 w-3" />
              <span>
                {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </span>
            </div>
          </div>
          <Badge
            variant="secondary"
            className={cn('text-white text-xs', statusConfig.color)}
          >
            <StatusIcon className="h-3 w-3 mr-1" />
            {statusConfig.label}
          </Badge>
        </div>

        {/* Info */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{formattedDate}</span>
          </div>

          {properties.observacoes && (
            <p className="text-muted-foreground line-clamp-2">
              {properties.observacoes}
            </p>
          )}
        </div>

        {/* Foto preview */}
        {properties.foto_url && (
          <div className="mt-3">
            <img
              src={properties.foto_url}
              alt="Criadouro"
              className="w-full h-24 object-cover rounded-md"
              loading="lazy"
            />
          </div>
        )}

        {/* Actions */}
        <div className="mt-3 flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 h-7 text-xs"
            onClick={() => onViewDetails?.(properties.id)}
          >
            Ver Detalhes
          </Button>
        </div>
      </div>
    </Popup>
  );
}

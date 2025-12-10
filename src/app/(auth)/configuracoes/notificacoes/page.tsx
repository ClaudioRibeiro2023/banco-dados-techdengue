'use client';

import { useState } from 'react';
import { Bell, Mail, Smartphone, AlertTriangle, CheckCircle, Loader2, Volume2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  email: boolean;
  push: boolean;
  sms: boolean;
}

const defaultSettings: NotificationSetting[] = [
  {
    id: 'novas_devolutivas',
    title: 'Novas Devolutivas',
    description: 'Receba alertas quando novos criadouros forem identificados',
    email: true,
    push: true,
    sms: false,
  },
  {
    id: 'devolutivas_pendentes',
    title: 'Devolutivas Pendentes',
    description: 'Lembrete de devolutivas aguardando tratamento',
    email: true,
    push: true,
    sms: false,
  },
  {
    id: 'atividades_agendadas',
    title: 'Atividades Agendadas',
    description: 'Notificação de voos e atividades programadas',
    email: true,
    push: true,
    sms: true,
  },
  {
    id: 'relatorios_gerados',
    title: 'Relatórios Gerados',
    description: 'Aviso quando novos relatórios estiverem disponíveis',
    email: true,
    push: false,
    sms: false,
  },
  {
    id: 'alertas_sistema',
    title: 'Alertas do Sistema',
    description: 'Notificações importantes sobre manutenção e atualizações',
    email: true,
    push: true,
    sms: false,
  },
  {
    id: 'resumo_semanal',
    title: 'Resumo Semanal',
    description: 'Receba um resumo das atividades da semana',
    email: true,
    push: false,
    sms: false,
  },
];

export default function NotificacoesPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<NotificationSetting[]>(defaultSettings);
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietHoursStart, setQuietHoursStart] = useState('22:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState('07:00');
  const [emailDigestFrequency, setEmailDigestFrequency] = useState('daily');

  const handleToggle = (settingId: string, channel: 'email' | 'push' | 'sms') => {
    setSettings(prev =>
      prev.map(setting =>
        setting.id === settingId
          ? { ...setting, [channel]: !setting[channel] }
          : setting
      )
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    toast.success('Preferências de notificação salvas!');
  };

  const handleEnableAll = () => {
    setSettings(prev =>
      prev.map(setting => ({ ...setting, email: true, push: true }))
    );
    toast.success('Todas as notificações ativadas');
  };

  const handleDisableAll = () => {
    setSettings(prev =>
      prev.map(setting => ({ ...setting, email: false, push: false, sms: false }))
    );
    toast.info('Todas as notificações desativadas');
  };

  return (
    <div className="space-y-6">
      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">Preferências de Notificação</CardTitle>
                <CardDescription>Configure como deseja receber alertas</CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDisableAll}>
                Desativar Todas
              </Button>
              <Button variant="outline" size="sm" onClick={handleEnableAll}>
                Ativar Todas
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Configurações por Tipo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tipos de Notificação</CardTitle>
          <CardDescription>Escolha os canais para cada tipo de alerta</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {/* Cabeçalho */}
            <div className="grid grid-cols-[1fr,80px,80px,80px] gap-4 py-2 px-2 text-sm font-medium text-muted-foreground">
              <div>Notificação</div>
              <div className="text-center flex items-center justify-center gap-1">
                <Mail className="h-4 w-4" />
                <span className="hidden sm:inline">Email</span>
              </div>
              <div className="text-center flex items-center justify-center gap-1">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Push</span>
              </div>
              <div className="text-center flex items-center justify-center gap-1">
                <Smartphone className="h-4 w-4" />
                <span className="hidden sm:inline">SMS</span>
              </div>
            </div>
            <Separator />

            {settings.map((setting, index) => (
              <div key={setting.id}>
                <div className="grid grid-cols-[1fr,80px,80px,80px] gap-4 py-4 px-2 items-center">
                  <div>
                    <p className="font-medium text-sm">{setting.title}</p>
                    <p className="text-xs text-muted-foreground">{setting.description}</p>
                  </div>
                  <div className="flex justify-center">
                    <Switch
                      checked={setting.email}
                      onCheckedChange={() => handleToggle(setting.id, 'email')}
                    />
                  </div>
                  <div className="flex justify-center">
                    <Switch
                      checked={setting.push}
                      onCheckedChange={() => handleToggle(setting.id, 'push')}
                    />
                  </div>
                  <div className="flex justify-center">
                    <Switch
                      checked={setting.sms}
                      onCheckedChange={() => handleToggle(setting.id, 'sms')}
                    />
                  </div>
                </div>
                {index < settings.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Horário Silencioso */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Volume2 className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">Horário Silencioso</CardTitle>
                <CardDescription>Pause notificações em horários específicos</CardDescription>
              </div>
            </div>
            <Switch
              checked={quietHoursEnabled}
              onCheckedChange={setQuietHoursEnabled}
            />
          </div>
        </CardHeader>
        {quietHoursEnabled && (
          <CardContent>
            <div className="flex flex-wrap gap-4 items-center">
              <div className="space-y-2">
                <Label htmlFor="start">Início</Label>
                <Select value={quietHoursStart} onValueChange={setQuietHoursStart}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, '0') + ':00';
                      return (
                        <SelectItem key={hour} value={hour}>
                          {hour}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="end">Fim</Label>
                <Select value={quietHoursEnd} onValueChange={setQuietHoursEnd}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, '0') + ':00';
                      return (
                        <SelectItem key={hour} value={hour}>
                          {hour}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Durante o horário silencioso, apenas alertas críticos serão enviados.
            </p>
          </CardContent>
        )}
      </Card>

      {/* Resumo por Email */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base">Resumo por Email</CardTitle>
              <CardDescription>Frequência do digest de notificações</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Frequência</Label>
              <Select value={emailDigestFrequency} onValueChange={setEmailDigestFrequency}>
                <SelectTrigger className="w-full max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="realtime">Tempo real</SelectItem>
                  <SelectItem value="hourly">A cada hora</SelectItem>
                  <SelectItem value="daily">Diário</SelectItem>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="never">Nunca</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
              {emailDigestFrequency === 'realtime' && (
                <p>Você receberá um email imediatamente para cada notificação.</p>
              )}
              {emailDigestFrequency === 'hourly' && (
                <p>Você receberá um resumo a cada hora com todas as notificações do período.</p>
              )}
              {emailDigestFrequency === 'daily' && (
                <p>Você receberá um email diário às 8h com o resumo do dia anterior.</p>
              )}
              {emailDigestFrequency === 'weekly' && (
                <p>Você receberá um email toda segunda-feira com o resumo da semana.</p>
              )}
              {emailDigestFrequency === 'never' && (
                <p>Você não receberá resumos por email, apenas notificações individuais conforme configurado acima.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status das Permissões */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Status das Permissões</CardTitle>
          <CardDescription>Verifique se as notificações estão configuradas corretamente</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
                <div>
                  <p className="font-medium text-sm">Notificações do navegador</p>
                  <p className="text-xs text-muted-foreground">Permissão concedida</p>
                </div>
              </div>
              <Button variant="outline" size="sm">Reconfigurar</Button>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
                <div>
                  <p className="font-medium text-sm">Email verificado</p>
                  <p className="text-xs text-muted-foreground">demo@techdengue.com</p>
                </div>
              </div>
              <Button variant="outline" size="sm">Alterar</Button>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="font-medium text-sm">Número de telefone</p>
                  <p className="text-xs text-muted-foreground">Não configurado</p>
                </div>
              </div>
              <Button variant="outline" size="sm">Adicionar</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botão Salvar */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            'Salvar Preferências'
          )}
        </Button>
      </div>
    </div>
  );
}

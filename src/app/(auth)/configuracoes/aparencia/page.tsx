'use client';

import { useState, useEffect } from 'react';
import { Palette, Sun, Moon, Monitor, Check, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const themes = [
  {
    id: 'light',
    name: 'Claro',
    icon: Sun,
    description: 'Tema claro para ambientes bem iluminados',
  },
  {
    id: 'dark',
    name: 'Escuro',
    icon: Moon,
    description: 'Tema escuro para reduzir cansaço visual',
  },
  {
    id: 'system',
    name: 'Sistema',
    icon: Monitor,
    description: 'Segue a preferência do seu sistema operacional',
  },
];

const accentColors = [
  { id: 'blue', name: 'Azul', color: 'bg-blue-500', hue: '221' },
  { id: 'emerald', name: 'Esmeralda', color: 'bg-emerald-500', hue: '160' },
  { id: 'violet', name: 'Violeta', color: 'bg-violet-500', hue: '263' },
  { id: 'rose', name: 'Rosa', color: 'bg-rose-500', hue: '350' },
  { id: 'amber', name: 'Âmbar', color: 'bg-amber-500', hue: '38' },
  { id: 'cyan', name: 'Ciano', color: 'bg-cyan-500', hue: '188' },
];

const fontSizes = [
  { id: 'small', name: 'Pequeno', scale: 0.875 },
  { id: 'medium', name: 'Médio', scale: 1 },
  { id: 'large', name: 'Grande', scale: 1.125 },
];

export default function AparenciaPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedAccent, setSelectedAccent] = useState('blue');
  const [selectedFontSize, setSelectedFontSize] = useState('medium');

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSavePreferences = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsSaving(false);
    toast.success('Preferências salvas com sucesso!');
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Tema */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <Palette className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base">Tema</CardTitle>
              <CardDescription>Escolha o tema de sua preferência</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {themes.map((t) => {
              const Icon = t.icon;
              const isSelected = theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={cn(
                    'relative flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all',
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={cn(
                      'p-3 rounded-lg',
                      t.id === 'light' && 'bg-white border shadow-sm',
                      t.id === 'dark' && 'bg-zinc-900 border border-zinc-700',
                      t.id === 'system' && 'bg-gradient-to-r from-white to-zinc-900 border'
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-6 w-6',
                        t.id === 'light' && 'text-amber-500',
                        t.id === 'dark' && 'text-blue-400',
                        t.id === 'system' && 'text-gray-500'
                      )}
                    />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Cor de Destaque */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cor de Destaque</CardTitle>
          <CardDescription>Personalize a cor principal da interface</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {accentColors.map((color) => (
              <button
                key={color.id}
                onClick={() => setSelectedAccent(color.id)}
                className={cn(
                  'relative flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all min-w-[80px]',
                  selectedAccent === color.id
                    ? 'border-primary'
                    : 'border-border hover:border-primary/50'
                )}
              >
                {selectedAccent === color.id && (
                  <div className="absolute top-1 right-1">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                )}
                <div className={cn('w-8 h-8 rounded-full', color.color)} />
                <span className="text-xs font-medium">{color.name}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            A cor selecionada será aplicada a botões, links e elementos de destaque.
          </p>
        </CardContent>
      </Card>

      {/* Tamanho da Fonte */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tamanho da Fonte</CardTitle>
          <CardDescription>Ajuste o tamanho do texto na interface</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={selectedFontSize}
            onValueChange={setSelectedFontSize}
            className="flex flex-col gap-3"
          >
            {fontSizes.map((size) => (
              <div key={size.id} className="flex items-center space-x-3">
                <RadioGroupItem value={size.id} id={size.id} />
                <Label htmlFor={size.id} className="flex items-center gap-4 cursor-pointer">
                  <span className="font-medium w-20">{size.name}</span>
                  <span
                    className="text-muted-foreground"
                    style={{ fontSize: `${size.scale}rem` }}
                  >
                    Texto de exemplo
                  </span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Pré-visualização */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pré-visualização</CardTitle>
          <CardDescription>Veja como ficará a interface com as configurações selecionadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 rounded-lg border bg-muted/30 space-y-4">
            <div className="flex items-center gap-3">
              <div className={cn('w-10 h-10 rounded-lg', accentColors.find(c => c.id === selectedAccent)?.color || 'bg-blue-500')} />
              <div>
                <p className="font-medium">Título de Exemplo</p>
                <p className="text-sm text-muted-foreground">Descrição do elemento</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm">Botão Primário</Button>
              <Button size="sm" variant="outline">Botão Secundário</Button>
            </div>
            <div className="flex gap-2">
              <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                Badge
              </div>
              <div className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-sm font-medium">
                Sucesso
              </div>
              <div className="px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-sm font-medium">
                Atenção
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botão Salvar */}
      <div className="flex justify-end">
        <Button onClick={handleSavePreferences} disabled={isSaving}>
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

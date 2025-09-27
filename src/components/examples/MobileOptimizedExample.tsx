import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MobileOptimizedDialog, MobileOptimizedDialogContent, MobileOptimizedDialogHeader, MobileOptimizedDialogTitle, MobileOptimizedDialogTrigger } from '@/components/MobileOptimizedDialog';
import { MobileResponsiveCard, MobileCardHeader, MobileCardTitle, MobileCardContent } from '@/components/MobileResponsiveCard';
import { MobileFloatingButton } from '@/components/MobileFloatingButton';
import { OptimizedMobileLayout } from '@/components/OptimizedMobileLayout';
import { SmoothLoadingSpinner } from '@/components/SmoothLoadingSpinner';
import { MobileBottomSheet } from '@/components/MobileBottomSheet';
import { Plus, Settings, MessageCircle } from 'lucide-react';
import { useMobileExperience } from '@/components/MobileExperienceProvider';

export const MobileOptimizedExample: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { isMobile, triggerRefresh } = useMobileExperience();

  const handleLoadDemo = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
  };

  const header = (
    <div className="flex items-center justify-between p-4">
      <h1 className="text-xl font-bold">Experiência Mobile</h1>
      <Button variant="ghost" size="sm">
        <Settings className="w-5 h-5" />
      </Button>
    </div>
  );

  return (
    <OptimizedMobileLayout header={header}>
      <div className="space-y-6">
        {/* Cards responsivos */}
        <div className="grid gap-4">
          <MobileResponsiveCard variant="elevated" clickable onClick={() => setDialogOpen(true)}>
            <MobileCardHeader>
              <MobileCardTitle>Dialog Otimizado</MobileCardTitle>
            </MobileCardHeader>
            <MobileCardContent>
              <p className="text-muted-foreground">
                Toque aqui para ver um dialog otimizado para mobile que se comporta como um bottom sheet nativo.
              </p>
            </MobileCardContent>
          </MobileResponsiveCard>

          <MobileResponsiveCard variant="glass" clickable onClick={() => setBottomSheetOpen(true)}>
            <MobileCardHeader>
              <MobileCardTitle>Bottom Sheet</MobileCardTitle>
            </MobileCardHeader>
            <MobileCardContent>
              <p className="text-muted-foreground">
                Bottom sheet nativo com gestos de deslizar e pontos de ajuste.
              </p>
            </MobileCardContent>
          </MobileResponsiveCard>

          <MobileResponsiveCard variant="outlined" clickable onClick={handleLoadDemo}>
            <MobileCardHeader>
              <MobileCardTitle>Loading Suave</MobileCardTitle>
            </MobileCardHeader>
            <MobileCardContent>
              {isLoading ? (
                <SmoothLoadingSpinner size="md" text="Carregando..." variant="dots" />
              ) : (
                <p className="text-muted-foreground">
                  Toque para ver o loading otimizado sem flashes.
                </p>
              )}
            </MobileCardContent>
          </MobileResponsiveCard>
        </div>

        {/* Exemplo de grid responsivo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(item => (
            <MobileResponsiveCard key={item} variant="default">
              <MobileCardContent>
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">#{item}</span>
                </div>
              </MobileCardContent>
            </MobileResponsiveCard>
          ))}
        </div>

        {/* Pull to refresh demo */}
        <MobileResponsiveCard>
          <MobileCardHeader>
            <MobileCardTitle>Pull to Refresh</MobileCardTitle>
          </MobileCardHeader>
          <MobileCardContent>
            <p className="text-muted-foreground">
              {isMobile 
                ? "Puxe para baixo na tela para atualizar o conteúdo" 
                : "Funcionalidade disponível apenas no mobile"
              }
            </p>
          </MobileCardContent>
        </MobileResponsiveCard>

        {/* Espaço para floating buttons */}
        <div className="h-20" />
      </div>

      {/* Floating Action Buttons */}
      <MobileFloatingButton 
        position="bottom-right"
        variant="default"
        onClick={() => setBottomSheetOpen(true)}
      >
        <Plus className="w-6 h-6" />
      </MobileFloatingButton>

      <MobileFloatingButton 
        position="bottom-left"
        variant="secondary"
        onClick={() => setDialogOpen(true)}
      >
        <MessageCircle className="w-6 h-6" />
      </MobileFloatingButton>

      {/* Dialog otimizado */}
      <MobileOptimizedDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <MobileOptimizedDialogContent>
          <MobileOptimizedDialogHeader>
            <MobileOptimizedDialogTitle>
              Dialog Mobile Otimizado
            </MobileOptimizedDialogTitle>
          </MobileOptimizedDialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Este dialog se adapta automaticamente: no mobile vira um bottom sheet, 
              no desktop mantém o comportamento tradicional.
            </p>
            <div className="flex gap-2">
              <Button className="flex-1" onClick={() => setDialogOpen(false)}>
                Confirmar
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </MobileOptimizedDialogContent>
      </MobileOptimizedDialog>

      {/* Bottom Sheet */}
      <MobileBottomSheet 
        isOpen={bottomSheetOpen}
        onClose={() => setBottomSheetOpen(false)}
        title="Bottom Sheet Nativo"
        snapPoints={[40, 80]}
        defaultSnapPoint={0}
      >
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Este é um bottom sheet nativo com gestos de deslizar. 
            Você pode:
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Deslizar para cima/baixo para ajustar altura</li>
            <li>• Deslizar para baixo para fechar</li>
            <li>• Tocar fora para fechar</li>
          </ul>
          <Button 
            className="w-full" 
            onClick={() => setBottomSheetOpen(false)}
          >
            Fechar
          </Button>
        </div>
      </MobileBottomSheet>
    </OptimizedMobileLayout>
  );
};
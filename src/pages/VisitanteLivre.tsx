import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Crown, DollarSign, Lock, Unlock, Eye, EyeOff, Share2, ArrowLeft, Settings, Upload, Edit, Link2, Smartphone, Coins } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useRealtimeMessages } from "@/hooks/useRealtimeMessages";
import { useGuestData } from "@/hooks/useGuestData";
// Logo removida - usando nova logo inline
import { EnhancedChat } from "@/components/EnhancedChat";
import { MediaShowcase } from "@/components/MediaShowcase";
import { GoogleAuthButton } from "@/components/GoogleAuthButton";
import { UserFloatingDialog } from "@/components/UserFloatingDialog";
import { AddCreditsDialog } from "@/components/AddCreditsDialog";
import { PremiumPlansManager } from "@/components/PremiumPlansManager";
import { getMediaUrl } from "@/lib/mediaUtils";
import { useRealtimeMedia } from "@/hooks/useRealtimeMedia";
import { useVisibilitySettings } from "@/hooks/useVisibilitySettings";
import { supabase } from "@/integrations/supabase/client";
import { PurchasedMediaSection } from "@/components/PurchasedMediaSection";
import { ChatOverlayButton } from "@/components/ChatOverlayButton";
import { useOptimizedAuth } from "@/hooks/useOptimizedAuth";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from '@/lib/utils';

const VisitanteLivre = () => {
  const { open } = useSidebar();
  
  const {
    mediaItems,
    isLoading: mediaLoading,
    error: mediaError
  } = useRealtimeMedia();
  const navigate = useNavigate();
  const {
    messages,
    sendMessage
  } = useRealtimeMessages();
  const {
    guestData,
    addGuestNotification,
    updateGuestCredits
  } = useGuestData();
  const {
    settings: visibilitySettings
  } = useVisibilitySettings(undefined, true);
  const { user: loggedInUser } = useOptimizedAuth();
  const [showPremiumDialog, setShowPremiumDialog] = useState(false);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showAddCreditsDialog, setShowAddCreditsDialog] = useState(false);
  
  // States for show/hide functionality like main page
  const [headerVisible, setHeaderVisible] = useState(true);
  const [creditsVisible, setCreditsVisible] = useState(true);

  // Estados para planos premium
  const [premiumPlans] = useState([{
    id: 'basic',
    title: 'Basic',
    price: '$9.99/month',
    description: ['• Unlimited chat', '• Basic content access'],
    link: '',
    stripeProductId: 'prod_SkHR3k5moylM8t'
  }, {
    id: 'pro',
    title: 'Pro',
    price: '$19.99/month',
    description: ['• Everything in Basic', '• Exclusive content', '• VIP interaction'],
    link: '',
    stripeProductId: 'prod_SkHY1XdCaL1NZY'
  }, {
    id: 'vip',
    title: 'VIP',
    price: '$39.99/month',
    description: ['• Everything in Pro', '• Full access', '• Private chat'],
    link: '',
    stripeProductId: 'prod_SkHcmX6aKWG7yi'
  }]);
  const streamerImage = "/lovable-uploads/7503b55d-e8fe-47c3-9366-ca734fd0c867.png";
  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/visitante-livre`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("🔗 Link copiado para a área de transferência!");
    } catch {
      if ((navigator as any).share) {
        try {
          await (navigator as any).share({
            url: shareUrl,
            title: "AuraLink - Visitante Livre"
          });
          return;
        } catch {}
      }
      toast.error("❌ Não foi possível copiar o link");
    }
  };
  const mainMedia = mediaItems.find(item => item.is_main) || {
    storage_path: streamerImage,
    is_blurred: false,
    price: "",
    type: 'image' as const
  };
  const mainMediaUrl = React.useMemo(() => getMediaUrl(mainMedia.storage_path), [mainMedia.storage_path]);
  const handleMediaClick = (item: any) => {
    if (item.link) {
      window.open(item.link, '_blank');
      toast.success("🔗 Link aberto! Todas as funcionalidades estão liberadas nesta visualização.");
    } else if (item.is_blurred || item.price) {
      toast.success("🔓 Conteúdo desbloqueado! Modo visitante livre ativado.");
    }
  };
  const handleUpload = (type: string) => {
    toast.success(`📁 Upload de ${type} habilitado! Todas as funcionalidades estão disponíveis.`);
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary to-background p-4">
      {/* Hide/Show Header Icon */}
      <Button
        onClick={() => setHeaderVisible(!headerVisible)}
        variant="ghost"
        size="sm"
        className={cn(
          "fixed top-4 z-50 bg-background/80 backdrop-blur-sm hover:bg-primary/10 transition-all duration-300 ease-in-out",
          open ? "left-[17rem]" : "left-20"
        )}
      >
        {headerVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </Button>

      {/* Hide/Show Credits Icon - Below Eye Icon */}
      <Button
        onClick={() => setCreditsVisible(!creditsVisible)}
        variant="ghost"
        size="sm"
        className={cn(
          "fixed top-16 z-50 bg-background/80 backdrop-blur-sm hover:bg-primary/10 transition-all duration-300 ease-in-out",
          open ? "left-[17rem]" : "left-20"
        )}
      >
        <Coins className="w-4 h-4" />
      </Button>

      {/* Header section with conditional visibility */}
      {headerVisible && (
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-4">Free Visitor Mode</h1>
        </div>
      )}

      {/* Main content area with conditional visibility */}
      {creditsVisible && (
        <div className="max-w-6xl mx-auto space-y-4">
        
        {/* Header - usando o mesmo estilo do UserView */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center w-full gap-4 sm:gap-2">
          
          {/* Controles da esquerda - controlados por visibilitySettings */}
          <div className="flex flex-col items-start gap-2 sm:flex-shrink-0">
            <div className="flex flex-col items-start gap-2">
              <ChatOverlayButton 
                creatorId={null}
                passwordProtected={false}
                isLoggedIn={!!loggedInUser}
                credits={guestData.credits}
                visibilitySettings={visibilitySettings}
              />
            </div>
            <div className="flex items-center gap-2">
              {visibilitySettings.showPremiumDialog && <Dialog open={showPremiumDialog} onOpenChange={setShowPremiumDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-6 py-2">
                      <Crown className="w-4 h-4 mr-2" />
                      BE PREMIUM
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>🌟 Planos Premium - Visitante Livre</DialogTitle>
                    </DialogHeader>
                    <PremiumPlansManager plans={premiumPlans} onPlansUpdate={() => {}} disabled={true} isUserView={false} />
                  </DialogContent>
                </Dialog>}

              <Button onClick={handleShare} className="rounded-full px-6 py-2" variant="secondary">
                <Share2 className="w-4 h-4 mr-2" />
                Compartilhar
              </Button>

              <Button onClick={() => setShowAddCreditsDialog(true)} className="bg-muted hover:bg-muted/90 rounded-full text-xs px-3 py-1.5 flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full animate-blink-circle"></div>
                <span className="text-green-500 font-medium">
                  {guestData.credits}
                </span>
                <span className="text-red-500 animate-blink-red font-medium">get credit</span>
              </Button>

              <Button onClick={() => navigate('/')} variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
              
              <Button onClick={async () => {
              const shareUrl = `${window.location.origin}/visitante-livre`;
              try {
                await navigator.clipboard.writeText(shareUrl);
                toast.success("🔗 Link da página copiado! Usuários logados e visitantes podem acessar!");
              } catch (error) {
                toast.error("❌ Erro ao copiar link");
              }
            }} variant="default" className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                <Share2 className="w-4 h-4" />
                Compartilhar Página
              </Button>
            </div>
            
            {/* Indicador especial do modo visitante livre */}
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg px-3 py-1.5 text-xs">
              <span className="text-green-600 font-medium">🔓 Modo:</span>
              <span className="ml-1 text-foreground font-bold">VISITANTE LIVRE</span>
            </div>
            
            {/* Dados técnicos do lado esquerdo */}
            <div className="bg-muted/50 border border-border rounded-lg px-3 py-2 text-xs space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">🔗 ID link gerado:</span>
                <span className="text-foreground font-mono">509bdca7_mebm61dd</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">👤 Criador:</span>
                <span className="text-foreground font-mono">171c4bb2</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">📊 Dados:</span>
                <span className="text-foreground">{mediaItems.length} mídias | 1 ícones sociais</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">🔗 ID permanente:</span>
                <span className="text-foreground font-mono text-[10px]">509bdca7-b48f-47ab-8150-261585a125c2</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">👨‍💻 Username:</span>
                <span className="text-foreground">-</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">📄 Nome da página:</span>
                <span className="text-foreground">AuraLink</span>
              </div>
            </div>
            
              {/* Botão para gerar link personalizado do criador */}
              <Button onClick={async () => {
            console.log('🔗 DEBUG: Generating personalized link...');

            // Verificar se o usuário está logado para capturar seu ID
            const {
              data: {
                user
              },
              error
            } = await supabase.auth.getUser();
            console.log('👤 DEBUG: User check:', {
              user: user?.id,
              error
            });
            if (!user) {
              toast.error("❌ Faça login para gerar um link personalizado!");
              return;
            }

            // Gerar ID único para a página baseado no usuário e timestamp
            const pageId = user.id.substring(0, 8) + '_' + Date.now().toString(36);
            const generatedUrl = `${window.location.origin}/generated/${pageId}`;
            console.log('🎯 DEBUG: Generated link details:', {
              userId: user.id,
              pageId,
              generatedUrl
            });
            try {
              await navigator.clipboard.writeText(generatedUrl);
              toast.success("🎉 Link personalizado gerado! Copiado para área de transferência.");

              // Mostrar toast com mais informações
              setTimeout(() => {
                toast.info(`✨ Link captura suas ${mediaItems.length} mídias e dados! Compartilhe à vontade.`);
              }, 1000);
            } catch (error) {
              console.error('💥 DEBUG: Clipboard error:', error);
              toast.error("❌ Erro ao gerar link personalizado. Tente novamente.");
            }
          }} variant="outline" size="sm" className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 border-blue-500/30 text-blue-700 hover:text-blue-800 transition-all duration-200">
                <Link2 className="w-3 h-3 mr-1.5" />
                Gerar Link Personalizado
              </Button>
          </div>

          {/* Logo centralizado */}
          <div className="flex items-center justify-center sm:flex-1 sm:mx-4">
            <div className="flex flex-col items-center gap-1">
              <img 
                src="/lovable-uploads/77dc0ba2-10ba-494b-b95e-2eeef10dcaea.png" 
                alt="AuraLink Logo" 
                className="h-8 sm:h-10 w-auto mb-1"
              />
              <div className="text-center">
                <h1 className="text-xl sm:text-2xl font-bold font-sans tracking-wide">
                  <span className="text-dream-white">Dream</span>
                  <span className="text-gold drop-shadow-sm">LINK</span>
                  <span className="text-dream-gray text-lg ml-1">TV</span>
                </h1>
                <p className="text-xs text-gray-600 font-medium tracking-wider lowercase">make your dreams come true</p>
              </div>
            </div>
          </div>

          {/* Google Auth sempre visível */}
          <div className="flex items-center justify-end gap-2 sm:flex-shrink-0">
            <GoogleAuthButton onLoginSuccess={() => setShowUserDialog(true)} />
          </div>
        </div>

        {/* Mídia principal - controlada por visibilitySettings */}
        {visibilitySettings.showMainMediaDisplay && <div className="relative">
          {mainMedia.type === 'video' ? <video 
            src={mainMediaUrl} 
            poster={mainMediaUrl}
            preload="metadata"
            muted
            playsInline
            controls 
            className="w-full max-h-80 md:max-h-96 lg:max-h-[500px] object-contain rounded-lg cursor-pointer" 
            onClick={() => handleMediaClick(mainMedia)} 
            title="Mídia principal - Sempre desbloqueada no modo visitante livre" /> : <img src={mainMediaUrl} alt="Streamer" className="w-full max-h-80 md:max-h-96 lg:max-h-[500px] object-contain rounded-lg cursor-pointer" onClick={() => handleMediaClick(mainMedia)} title="Mídia principal - Sempre desbloqueada no modo visitante livre" />}
          {/* Overlay especial indicando que está desbloqueado */}
          <div className="absolute top-2 left-2">
            
          </div>
        </div>}

        {/* Showcase de mídia - controlado por visibilitySettings */}
        {visibilitySettings.showVitrine && <MediaShowcase mediaItems={mediaItems} onUploadImage={() => handleUpload('imagem')} onUploadVideo={() => handleUpload('vídeo')} onReplaceMedia={() => toast.success("🔄 Substituição de mídia habilitada!")} onUpdateMedia={() => {}} onDeleteMedia={() => toast.success("🗑️ Exclusão de mídia habilitada!")} onSetAsMain={() => toast.success("⭐ Definir como principal habilitado!")} onEditMedia={() => toast.success("✏️ Edição de mídia habilitada!")} onSetPrice={() => toast.success("💰 Configuração de preço habilitada!")} onSetLink={() => toast.success("🔗 Configuração de link habilitada!")} passwordProtected={false} onPasswordVerify={() => {}} credits={guestData.credits} onAddCredits={() => toast.success("💳 Sistema de créditos habilitado!")} onSubtractCredits={async () => {
        toast.success("💸 Dedução de créditos habilitada!");
        return true;
      }} visibilitySettings={{
        showUploadButtons: visibilitySettings.showUploadButtons,
        showEditIcons: visibilitySettings.showEditIcons,
        showMediaActions: visibilitySettings.showMediaActions,
        showVitrine: visibilitySettings.showVitrine
      }} creatorId={null} />}

        {visibilitySettings.showChat && <Card className="p-4 bg-card border">
          <div className="flex flex-col items-center mb-4">
            {/* Área de interação social */}
            <div className="flex items-center gap-4 mb-4">
              <div className="text-center">
                
              </div>
            </div>
          </div>
          
          {/* Chat com TODAS as funcionalidades habilitadas */}
          <EnhancedChat messages={messages} onSendMessage={sendMessage} onEditMessage={() => toast.success("✏️ Edição de mensagem habilitada!")} passwordProtected={false} onPasswordVerify={() => {}} visibilitySettings={{
          showChatEditing: visibilitySettings.showChatEditing,
          showChatCloseIcon: visibilitySettings.showChatCloseIcon
        }} />
        </Card>}

        {/* Seção Meu Conteúdo Comprado - mostra compras do usuário logado */}
        {loggedInUser && (
          <PurchasedMediaSection onSetAsMain={async (mediaId: string) => {
            try {
              // Buscar qual criador possui esta mídia
              const { data: mediaData, error: mediaFetchError } = await supabase
                .from('media_items')
                .select('user_id')
                .eq('id', mediaId)
                .single();

              if (mediaFetchError || !mediaData) {
                toast.error("❌ Erro ao encontrar mídia");
                return;
              }

              const creatorId = mediaData.user_id;

              // Primeiro, remove is_main de todas as mídias do criador
              const { error: updateError } = await supabase
                .from('media_items')
                .update({ is_main: false })
                .eq('user_id', creatorId);

              if (updateError) {
                console.error('Erro ao resetar mídia principal:', updateError);
                toast.error("❌ Erro ao atualizar mídia");
                return;
              }

              // Depois define a mídia selecionada como principal E remove o blur/lock já que foi comprada
              const { error: setMainError } = await supabase
                .from('media_items')
                .update({ 
                  is_main: true,
                  is_blurred: false, // Remove blur após compra
                  is_locked: false   // Remove lock após compra
                })
                .eq('id', mediaId)
                .eq('user_id', creatorId);

              if (setMainError) {
                console.error('Erro ao definir mídia principal:', setMainError);
                toast.error("❌ Erro ao definir mídia principal");
                return;
              }

              toast.success("⭐ Mídia ativada na tela principal!");
            } catch (error) {
              console.error('Erro inesperado:', error);
              toast.error("❌ Erro inesperado ao definir mídia principal");
            }
          }} />
        )}

        {/* Informações especiais do modo visitante livre */}
        

        <UserFloatingDialog isOpen={showUserDialog} onClose={() => setShowUserDialog(false)} />

        <AddCreditsDialog open={showAddCreditsDialog} onOpenChange={setShowAddCreditsDialog} />

      </div>
      )}
    </div>
  );
};

export default VisitanteLivre;
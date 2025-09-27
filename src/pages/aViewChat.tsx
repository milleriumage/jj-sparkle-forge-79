import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Crown, DollarSign, Lock, Unlock, Eye, EyeOff, Share2, ArrowLeft, Settings, Smartphone, Coins } from "lucide-react";
import { toast } from "sonner";
import { useSearchParams, useParams } from "react-router-dom";
import { useCreatorMessages } from "@/hooks/useCreatorMessages";
import { useUserCredits } from "@/hooks/useUserCredits";
import { useSubscription } from "@/hooks/useSubscription";
import { useVisibilitySettings } from "@/hooks/useVisibilitySettings";
import { EnhancedChat } from "@/components/EnhancedChat";
import { MediaShowcase } from "@/components/MediaShowcase";
import { GoogleAuthButton } from "@/components/GoogleAuthButton";
import { UserFloatingDialog } from "@/components/UserFloatingDialog";
import { AddCreditsDialog } from "@/components/AddCreditsDialog";
import { PremiumPlansManager } from "@/components/PremiumPlansManager";
// Controle de notificações - altere para true para reativar
const NOTIFICATIONS_ENABLED = false;

import { CreditSuccessNotification } from "@/components/CreditSuccessNotification";
import { SubscriptionSuccessNotification } from "@/components/SubscriptionSuccessNotification";
import { ActivePlanIndicator } from "@/components/ActivePlanIndicator";
import { getMediaUrl } from "@/lib/mediaUtils";
import { fixMediaPolicies } from "@/utils/fixMediaPolicies";
import { useCreatorPermissions } from "@/hooks/useCreatorPermissions";
import { SocialMediaIcons } from "@/components/SocialMediaIcons";
import { useCreatorSocialIcons } from "@/hooks/useCreatorSocialIcons";
import { PagePausedMessage } from "@/components/PagePausedMessage";
import { FollowButton } from "@/components/FollowButton";
import { FollowersCounter } from "@/components/FollowersCounter";
import { useFollowers } from "@/hooks/useFollowers";
import { useCreatorWishlist } from "@/hooks/useCreatorWishlist";
import { PurchasedMediaSection } from "@/components/PurchasedMediaSection";
import { ChatOverlayButton } from "@/components/ChatOverlayButton";
import { BottomNavigation } from "@/components/BottomNavigation";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from '@/lib/utils';

const UserView = () => {
  const { open } = useSidebar();
  
  const {
    creatorId: rawCreatorId
  } = useParams<{
    creatorId: string;
  }>();
  // Map "default" to template user ID - evitar conflito com dados guest
  const creatorId = rawCreatorId === 'default' ? '509bdca7-b48f-47ab-8150-261585a125c2' : rawCreatorId;
  const isViewingCreatorPage = !!creatorId;
  const {
    messages,
    sendMessage
  } = useCreatorMessages(creatorId);
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const {
    credits,
    isLoading: creditsLoading,
    addCredits,
    isLoggedIn
  } = useUserCredits();
  const {
    subscribed,
    subscription_tier,
    checkSubscription
  } = useSubscription();
  const {
    settings: visibilitySettings
  } = useVisibilitySettings(creatorId);
  const {
    isCreator,
    canEdit
  } = useCreatorPermissions(creatorId);
  const [searchParams, setSearchParams] = useSearchParams();
  const [creatorProfile, setCreatorProfile] = useState<any>(null);
  const [showPremiumDialog, setShowPremiumDialog] = useState(false);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showAddCreditsDialog, setShowAddCreditsDialog] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [addedCredits, setAddedCredits] = useState(0);
  const [showSubscriptionSuccess, setShowSubscriptionSuccess] = useState(false);
  
  // States for show/hide functionality like main page
  const [headerVisible, setHeaderVisible] = useState(true);
  const [creditsVisible, setCreditsVisible] = useState(true);
  const [subscribedPlan, setSubscribedPlan] = useState('');
  const [isPagePrivate, setIsPagePrivate] = useState(false);
  const [pageVisibilityLoading, setPageVisibilityLoading] = useState(true);
  
  // Social media icons - usar o creatorId para buscar os dados do criador da página
  const { socialNetworks, updateSocialNetwork, addSocialNetwork, deleteSocialNetwork, isLoading } = useCreatorSocialIcons(creatorId);
  
  // Sistema de seguidores
  const { isFollowing, followersCount, toggleFollow } = useFollowers(creatorId);

  // Carregar wishlist do criador para visitantes
  const { wishlistItems: creatorWishlistItems } = useCreatorWishlist(creatorId);

  // Carregar dados do criador e suas mídias - OTIMIZADO
  useEffect(() => {
    const loadCreatorData = async () => {
      if (!creatorId || !isViewingCreatorPage) {
        setPageVisibilityLoading(false);
        return;
      }
      
      try {
        // Carregar apenas dados essenciais primeiro para carregamento rápido
        const {
          data: profileData,
          error: profileError
        } = await supabase.from('profiles')
          .select('user_id, display_name, bio, settings')
          .eq('user_id', creatorId)
          .single();
        
        if (profileError) {
          console.error('Error loading creator profile:', profileError);
          toast.error('❌ Criador não encontrado');
          setPageVisibilityLoading(false);
          return;
        }
        
        setCreatorProfile(profileData);

        // Check if page is private (only for non-creators)
        if (!isCreator) {
          const settings = (profileData?.settings as any) || {};
          const pagePublic = settings.pagePublic !== false;
          setIsPagePrivate(!pagePublic);
          
          if (!pagePublic) {
            setPageVisibilityLoading(false);
            return;
          }
        }

        // Carregamento instantâneo da UI
        setPageVisibilityLoading(false);

        // Carregar mídias de forma assíncrona e otimizada
        setTimeout(async () => {
          try {
            const {
              data: mediaData,
              error: mediaError
            } = await supabase.from('media_items')
              .select('id, type, storage_path, is_main, is_blurred, price, description, created_at')
              .eq('user_id', creatorId)
              .order('created_at', { ascending: false })
              .limit(10); // Limitar para melhor performance
            
            if (!mediaError && mediaData) {
              setMediaItems(mediaData);
            }
          } catch (error) {
            console.error('Error loading media:', error);
          }
        }, 50); // Delay mínimo para UI responsiva
        
      } catch (error) {
        console.error('Unexpected error loading creator data:', error);
        setPageVisibilityLoading(false);
      }
    };
    
    loadCreatorData();
  }, [creatorId, isViewingCreatorPage, isCreator]);

  // Verificar se veio de pagamento bem-sucedido
  useEffect(() => {
    const paymentSuccess = searchParams.get('payment_success');
    const creditsParam = searchParams.get('credits');
    const subscriptionSuccess = searchParams.get('subscription_success');
    const planParam = searchParams.get('plan');
    if (paymentSuccess === 'true' && creditsParam) {
      const creditsAmount = parseInt(creditsParam);
      setAddedCredits(creditsAmount);
      setShowSuccessNotification(true);
      addCredits(creditsAmount);

      // Limpar parâmetros da URL
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('payment_success');
      newSearchParams.delete('credits');
      setSearchParams(newSearchParams, {
        replace: true
      });
    }
    if (subscriptionSuccess === 'true' && planParam) {
      setSubscribedPlan(planParam);
      setShowSubscriptionSuccess(true);
      checkSubscription(); // Refresh subscription status

      // Limpar parâmetros da URL
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('subscription_success');
      newSearchParams.delete('plan');
      setSearchParams(newSearchParams, {
        replace: true
      });

      // Auto-hide notification after 30 seconds
      setTimeout(() => {
        setShowSubscriptionSuccess(false);
      }, 30000);
    }
  }, [searchParams, setSearchParams, addCredits, checkSubscription]);

  // Estados para planos premium com produtos do Stripe
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
  const handlePlanClick = (planName: string) => {
    window.open("https://www.google.com", "_blank");
  };
  const handleShare = async () => {
    if (!rawCreatorId) return;
    const shareUrl = `${window.location.origin}/user/${rawCreatorId}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("🔗 Link copiado para a área de transferência!");
    } catch {
      if ((navigator as any).share) {
        try {
          await (navigator as any).share({
            url: shareUrl,
            title: "AuraLink"
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
    } else if (item.is_blurred || item.price) {
      toast.info("🔒 Conteúdo premium! Assine para ter acesso.");
    }
  };
  
  // Show loading or private page message
  if (pageVisibilityLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary to-background p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando página...</p>
        </div>
      </div>
    );
  }

  if (isPagePrivate && !isCreator) {
    return <PagePausedMessage />;
  }

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
          <div className="flex flex-col items-center gap-1">
            <div className="text-center">
              <h1 className="text-xl sm:text-2xl font-bold font-sans tracking-wide">
                <span className="bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">Social</span>
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent ml-2">Link</span>
              </h1>
              <p className="text-sm text-muted-foreground">For Influencers, Creators & Sellers</p>
            </div>
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="max-w-6xl mx-auto space-y-4">
        
        {/* Header simplificado para usuários */}
        {creditsVisible && (
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center w-full gap-4 sm:gap-2">
            
            {/* Be Premium */}
            {visibilitySettings.showPremiumDialog && (
              <Dialog open={showPremiumDialog} onOpenChange={setShowPremiumDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-6 py-2">
                    <Crown className="w-4 h-4 mr-2" />
                    BE PREMIUM
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <PremiumPlansManager 
                    plans={premiumPlans} 
                    onPlansUpdate={() => {}} 
                    disabled={true} 
                    isUserView={true} 
                  />
                </DialogContent>
              </Dialog>
            )}

            {/* Compartilhar */}
            <Button onClick={handleShare} className="rounded-full px-6 py-2" variant="secondary">
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar
            </Button>

            {/* Seguidores */}
            <FollowersCounter 
              creatorId={creatorId} 
              showForCreator={isCreator}
            />
            
            {/* Créditos */}
            {isLoggedIn && (
              <div className="flex items-center gap-1 px-3 py-1 bg-green-100 border border-green-300 rounded-full text-xs text-green-700 font-medium">
                <span>💰</span>
                <span>{credits} créditos</span>
              </div>
            )}
            
            {/* Ícone do perfil */}
            <GoogleAuthButton onLoginSuccess={() => setShowUserDialog(true)} />
          </div>
        )}

        {/* Mídia principal - usuários podem ver mas com restrições */}
        {visibilitySettings.showMainMediaDisplay && (
          <div className="relative">
            {mainMedia.type === 'video' ? 
              <video 
                src={mainMediaUrl} 
                poster={mainMediaUrl}
                preload="metadata"
                muted
                playsInline
                controls 
                className={`w-full max-h-80 md:max-h-96 lg:max-h-[500px] object-contain rounded-lg cursor-pointer ${mainMedia.is_blurred ? 'blur-md' : ''}`} 
                onClick={() => handleMediaClick(mainMedia)} 
                title={(mainMedia as any).description || "Main display"} 
              /> : 
              <img 
                src={mainMediaUrl} 
                alt="Streamer" 
                className={`w-full max-h-80 md:max-h-96 lg:max-h-[500px] object-contain rounded-lg cursor-pointer ${mainMedia.is_blurred ? 'blur-md' : ''}`} 
                onClick={() => handleMediaClick(mainMedia)} 
                title={(mainMedia as any).description || "Main display"} 
              />
            }
          </div>
        )}

        {/* Showcase de mídia - controlado pelas configurações de visibilidade */}
        {(() => {
        if (import.meta.env.DEV) console.log('👁️ DEBUG: Media showcase visibility check:', {
          showVitrine: visibilitySettings.showVitrine,
          showMediaToVisitors: visibilitySettings.showMediaToVisitors,
          mediaItemsCount: mediaItems.length,
          hasCreatorProfile: !!creatorProfile
        });
        return visibilitySettings.showVitrine ? <MediaShowcase mediaItems={mediaItems} onUploadImage={canEdit ? () => toast.info("🔒 Funcionalidade não implementada para visitantes!") : () => toast.info("🔒 Apenas o criador pode fazer upload!")} onUploadVideo={canEdit ? () => toast.info("🔒 Funcionalidade não implementada para visitantes!") : () => toast.info("🔒 Apenas o criador pode fazer upload!")} onReplaceMedia={canEdit ? () => toast.info("🔒 Funcionalidade não implementada para visitantes!") : () => toast.info("🔒 Apenas o criador pode editar!")} onUpdateMedia={() => {}} onDeleteMedia={canEdit ? () => toast.info("🔒 Funcionalidade não implementada para visitantes!") : () => toast.info("🔒 Apenas o criador pode deletar!")} onSetAsMain={canEdit ? () => toast.info("🔒 Funcionalidade não implementada para visitantes!") : () => toast.info("🔒 Apenas o criador pode editar!")} onEditMedia={canEdit ? () => toast.info("🔒 Funcionalidade não implementada para visitantes!") : () => toast.info("🔒 Apenas o criador pode editar!")} onSetPrice={canEdit ? () => toast.info("🔒 Funcionalidade não implementada para visitantes!") : () => toast.info("🔒 Apenas o criador pode editar!")} onSetLink={canEdit ? () => toast.info("🔒 Funcionalidade não implementada para visitantes!") : () => toast.info("🔒 Apenas o criador pode editar!")} passwordProtected={false} onPasswordVerify={() => {}} credits={isLoggedIn ? credits : 0} onAddCredits={addCredits} onSubtractCredits={async () => {
          if (!canEdit) {
            toast.info("🔒 Apenas o criador pode usar créditos!");
            return false;
          }
          toast.info("🔒 Funcionalidade não implementada para visitantes!");
          return false;
        }} visibilitySettings={{
          showUploadButtons: visibilitySettings.showUploadButtons,
          showEditIcons: visibilitySettings.showEditIcons,
          showMediaActions: visibilitySettings.showMediaActions,
          showVitrine: visibilitySettings.showVitrine,
          showMediaInteractionStats: visibilitySettings.showMediaInteractionStats,
          showVitrineBackgroundEdit: visibilitySettings.showVitrineBackgroundEdit
        }} creatorId={creatorId} /> : <Card className="p-6 text-center">
              <div className="space-y-2">
                <EyeOff className="w-8 h-8 mx-auto text-muted-foreground" />
                <h3 className="font-medium text-muted-foreground">Vitrine de Mídia Oculta</h3>
                <p className="text-sm text-muted-foreground">
                  O criador optou por manter a vitrine privada para visitantes.
                </p>
              </div>
            </Card>;
      })()}

        <Card className="p-4 bg-card border">
          <div className="flex flex-col items-center mb-4">
            {/* Ícones de redes sociais - removido seção duplicada, já incluído no MediaShowcase */}
          </div>
          
          {/* Chat para usuários - edição controlada pelas configurações de visibilidade */}
          {visibilitySettings.showChat && (
            <EnhancedChat 
              messages={messages} 
              onSendMessage={sendMessage} 
              onEditMessage={() => toast.info("🔒 Apenas criadores podem editar mensagens!")} 
              passwordProtected={false} 
              onPasswordVerify={() => {}} 
              creatorId={creatorId}
              visibilitySettings={{
                showChatEditing: visibilitySettings.showChatEditing,
                showChatCloseIcon: visibilitySettings.showChatCloseIcon
              }} 
            />
          )}
        </Card>

        {/* Seção Meu Conteúdo Comprado - mostra compras do usuário logado na página do criador */}
        {isLoggedIn && !isCreator && creatorId && (
          <PurchasedMediaSection onSetAsMain={async (mediaId: string) => {
            try {
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

              // Atualizar estado local
              setMediaItems(prevItems => 
                prevItems.map(item => ({
                  ...item,
                  is_main: item.id === mediaId,
                  // Se for a mídia que foi definida como principal, remove blur e lock
                  is_blurred: item.id === mediaId ? false : item.is_blurred,
                  is_locked: item.id === mediaId ? false : item.is_locked
                }))
              );

              toast.success("⭐ Mídia ativada na tela principal!");
            } catch (error) {
              console.error('Erro inesperado:', error);
              toast.error("❌ Erro inesperado ao definir mídia principal");
            }
          }} />
        )}

        <UserFloatingDialog isOpen={showUserDialog} onClose={() => setShowUserDialog(false)} />

        <AddCreditsDialog open={showAddCreditsDialog} onOpenChange={setShowAddCreditsDialog} />

        {NOTIFICATIONS_ENABLED && showSuccessNotification && <CreditSuccessNotification credits={addedCredits} onClose={() => setShowSuccessNotification(false)} />}

        {NOTIFICATIONS_ENABLED && showSubscriptionSuccess && <SubscriptionSuccessNotification planName={subscribedPlan} onClose={() => setShowSubscriptionSuccess(false)} />}

        {/* Bottom Navigation */}
        <BottomNavigation />
      </div>
    </div>
  );
};
export default UserView;
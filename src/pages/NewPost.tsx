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
// Logo removida - usando nova logo inline
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

const NewPost = () => {
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

  // Carregar dados do criador e suas mídias com carregamento otimizado
  useEffect(() => {
    const loadCreatorData = async () => {
      if (!creatorId || !isViewingCreatorPage) return;
      
      try {
        // Carregamento rápido apenas do perfil essencial
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('user_id, settings')
          .eq('user_id', creatorId)
          .single();

        if (profileError) {
          console.error('Profile error:', profileError);
          setPageVisibilityLoading(false);
          return;
        }

        setCreatorProfile(profileData);

        // Verificar privacidade da página
        if (!isCreator) {
          const settings = (profileData?.settings as any) || {};
          const pagePublic = settings.pagePublic !== false;
          setIsPagePrivate(!pagePublic);
          
          if (!pagePublic) {
            setPageVisibilityLoading(false);
            return;
          }
        }

        // Carregamento lazy das mídias (apenas as principais)
        const { data: mediaData } = await supabase
          .from('media_items')
          .select('id, type, is_main, storage_path, is_blurred, price')
          .eq('user_id', creatorId)
          .eq('is_main', true)
          .limit(1)
          .single();

        if (mediaData) {
          setMediaItems([mediaData]);
        }

      } catch (error) {
        console.error('Error loading creator data:', error);
      } finally {
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
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
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
                <span className="bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">New</span>
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent ml-2">Post</span>
              </h1>
              <p className="text-sm text-muted-foreground">Create Your Content</p>
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
            {mainMedia.type === 'video' ? <video 
              src={mainMediaUrl} 
              poster={mainMediaUrl}
              preload="metadata"
              muted
              playsInline
              controls 
              className={`w-full max-h-80 md:max-h-96 lg:max-h-[500px] object-contain rounded-lg cursor-pointer ${mainMedia.is_blurred ? 'blur-md' : ''}`} 
              onClick={() => handleMediaClick(mainMedia)} 
              title={(mainMedia as any).description || "Main display"} /> : <img src={mainMediaUrl} alt="Streamer" className={`w-full max-h-80 md:max-h-96 lg:max-h-[500px] object-contain rounded-lg cursor-pointer ${mainMedia.is_blurred ? 'blur-md' : ''}`} onClick={() => handleMediaClick(mainMedia)} title={(mainMedia as any).description || "Main display"} />}
          </div>
        )}

        {/* Container flex para as seções - usando a mesma lógica do UserView */}
        <div className="flex flex-col lg:flex-row gap-4">
          
        {/* Seção de mídias simplificada */}
        {visibilitySettings.showVitrine && (
          <div className="flex-1">
            <Card className="p-4">
              <h3 className="font-semibold mb-3 text-center">📷 Criar Novo Post</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {mediaItems.slice(0, 6).map((item: any) => (
                  <div
                    key={item.id}
                    className="relative aspect-square bg-secondary/20 rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => handleMediaClick(item)}
                  >
                    {item.type === 'video' ? (
                      <video
                        src={getMediaUrl(item.storage_path)}
                        className={`w-full h-full object-cover ${item.is_blurred ? 'blur-md' : ''}`}
                        muted
                        playsInline
                      />
                    ) : (
                      <img
                        src={getMediaUrl(item.storage_path)}
                        alt="Media item"
                        className={`w-full h-full object-cover ${item.is_blurred ? 'blur-md' : ''}`}
                      />
                    )}
                    {item.price && (
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                        {item.price}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
          
          {/* Seção lateral com chat e ícones sociais */}
          <div className="lg:w-80 space-y-4">
            
          {/* Wishlist do criador - mostrar para visitantes */}
          {creatorWishlistItems.length > 0 && (
            <Card className="p-4">
              <h3 className="font-semibold mb-3 text-center">🎁 Lista de Desejos</h3>
              <div className="space-y-3">
                {creatorWishlistItems.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between p-2 bg-secondary/50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.price}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => item.link && window.open(item.link, '_blank')}
                      disabled={!item.link}
                      className="ml-2"
                    >
                      <DollarSign className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Chat somente para usuários logados */}
          {isLoggedIn && visibilitySettings.showChat && (
            <div className="relative">
              <EnhancedChat 
                messages={messages}
                onSendMessage={sendMessage}
                onEditMessage={() => toast.info("🔒 Apenas criadores podem editar mensagens!")}
                passwordProtected={false}
                onPasswordVerify={() => {}}
                creatorId={creatorId}
                credits={credits}
              />
            </div>
          )}

          {/* Ícones das redes sociais */}
          {socialNetworks.length > 0 && (
            <Card className="p-4">
              <h3 className="font-semibold mb-3 text-center">🔗 Redes Sociais</h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {socialNetworks.map((network: any) => (
                  <Button
                    key={network.id}
                    variant="outline"
                    size="sm"
                    onClick={() => network.url && window.open(network.url, '_blank')}
                    disabled={!network.url}
                  >
                    {network.platform}
                  </Button>
                ))}
              </div>
            </Card>
          )}
          </div>
        </div>
      </div>

      {/* Dialog de créditos */}
      <AddCreditsDialog 
        open={showAddCreditsDialog}
        onOpenChange={setShowAddCreditsDialog}
      />

      {/* Dialog de perfil de usuário */}
      <UserFloatingDialog
        isOpen={showUserDialog}
        onClose={() => setShowUserDialog(false)}
      />

      {/* Notificações */}
      {NOTIFICATIONS_ENABLED && showSuccessNotification && (
        <CreditSuccessNotification
          credits={addedCredits}
          onClose={() => setShowSuccessNotification(false)}
        />
      )}

      {NOTIFICATIONS_ENABLED && showSubscriptionSuccess && (
        <SubscriptionSuccessNotification
          planName={subscribedPlan}
          onClose={() => setShowSubscriptionSuccess(false)}
        />
      )}

      {/* Botões de chat flutuante - mostrar apenas se chat não estiver visível na sidebar */}
      {!visibilitySettings.showChat && isLoggedIn && (
        <ChatOverlayButton creatorId={creatorId} />
      )}

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default NewPost;
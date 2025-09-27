import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useCreatorMessages } from "@/hooks/useCreatorMessages";
import { useUserCredits } from "@/hooks/useUserCredits";
import { EnhancedChat } from "@/components/EnhancedChat";
import { getMediaUrl } from "@/lib/mediaUtils";
import { BottomNavigation } from "@/components/BottomNavigation";

const CinemaView = () => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [mainMedia, setMainMedia] = useState<any>(null);
  const [isChatBottom, setIsChatBottom] = useState(false);
  
  // Use current logged user as creator
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    getCurrentUser();
  }, []);

  const creatorId = currentUserId;
  
  const {
    messages,
    sendMessage
  } = useCreatorMessages(creatorId);
  
  const {
    credits,
    isLoggedIn
  } = useUserCredits();

  // Carregar mídia principal do usuário
  useEffect(() => {
    const loadMainMedia = async () => {
      if (!creatorId) return;
      
      try {
        const { data: mediaData } = await supabase
          .from('media_items')
          .select('*')
          .eq('user_id', creatorId)
          .eq('is_main', true)
          .single();
          
        if (mediaData) {
          setMainMedia(mediaData);
        }
      } catch (error) {
        console.error('Error loading main media:', error);
      }
    };
    
    loadMainMedia();
  }, [creatorId]);

  const mainMediaUrl = mainMedia ? getMediaUrl(mainMedia.storage_path) : null;

  if (!creatorId) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-muted-foreground">Faça login para acessar o cinema</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-black ${isChatBottom ? 'flex flex-col' : 'flex'}`}>
      {/* Tela Principal - Cinema */}
      <div className={`${isChatBottom ? 'flex-1 min-h-0' : 'flex-1'} flex items-center justify-center p-4`}>
        {mainMedia && mainMediaUrl ? (
          <div className="w-full max-w-4xl">
            {mainMedia.type === 'video' ? (
              <video 
                src={mainMediaUrl} 
                controls 
                autoPlay
                className="w-full h-auto rounded-lg shadow-2xl"
                style={{ maxHeight: isChatBottom ? '50vh' : '80vh' }}
              />
            ) : (
              <img 
                src={mainMediaUrl} 
                alt="Cinema Display" 
                className="w-full h-auto rounded-lg shadow-2xl object-contain"
                style={{ maxHeight: isChatBottom ? '50vh' : '80vh' }}
              />
            )}
          </div>
        ) : (
          <div className="text-center text-white">
            <h2 className="text-2xl mb-4">🎬 Sala de Cinema</h2>
            <p className="text-gray-400">Nenhum conteúdo principal configurado</p>
          </div>
        )}
      </div>

      {/* Chat Integrado */}
      <div className={`${isChatBottom ? 'flex-shrink-0 h-1/2' : 'border-l border-gray-800 w-1/3'} bg-gray-900`}>
        <EnhancedChat 
          creatorId={creatorId}
          messages={messages}
          onSendMessage={sendMessage}
          onEditMessage={() => {}}
          passwordProtected={false}
          onPasswordVerify={() => {}}
          onTrialCheck={() => true}
          onSubtractCredits={() => {}}
          credits={credits}
          isLoggedIn={isLoggedIn}
          visibilitySettings={{
            showChatEditing: true,
            showChatCloseIcon: false
          }}
          onPositionChange={setIsChatBottom}
        />
      </div>

      {/* Bottom Navigation */}
      {!isChatBottom && (
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <BottomNavigation />
        </div>
      )}
    </div>
  );
};

export default CinemaView;
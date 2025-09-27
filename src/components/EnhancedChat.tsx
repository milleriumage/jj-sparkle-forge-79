import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Upload, Mic, Send, Edit, Plus, X, DoorOpen, Heart, Play, Pause, Palette, Crown, Minimize2, Maximize2, RotateCcw } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { useChatControls } from "@/hooks/useChatControls";
import { UserLinkDisplay } from "@/components/UserLinkDisplay";
import { useChatConfiguration } from "@/hooks/useChatConfiguration";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { useOnlinePresence } from "@/hooks/useOnlinePresence";
import { useBlockedUsers } from "@/hooks/useBlockedUsers";
import { useCreatorPermissions } from "@/hooks/useCreatorPermissions";
import { OnlineUsersDialog } from "@/components/OnlineUsersDialog";
import { GuestProfileDialog } from './GuestProfileDialog';
import { useGuestData } from '@/hooks/useGuestData';
import { supabase } from '@/integrations/supabase/client';

interface EnhancedChatProps {
  messages: any[];
  onSendMessage: (username: string, message: string, color: string, speech?: string) => void;
  onEditMessage: (message: any) => void;
  passwordProtected: boolean;
  onPasswordVerify: (callback: () => void) => void;
  onTrialCheck?: () => boolean;
  onSubtractCredits?: (amount: number, action?: string) => void;
  credits?: number;
  isLoggedIn?: boolean;
  visibilitySettings?: {
    showChatEditing?: boolean;
    showChatCloseIcon?: boolean;
  };
  creatorId?: string;
  onPositionChange?: (isBottom: boolean) => void;
}

export const EnhancedChat = ({
  messages,
  onSendMessage,
  onEditMessage,
  passwordProtected,
  onPasswordVerify,
  onTrialCheck,
  onSubtractCredits,
  credits = 0,
  isLoggedIn = false,
  visibilitySettings,
  creatorId,
  onPositionChange
}: EnhancedChatProps) => {
  const [currentMessage, setCurrentMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [expandedImage, setExpandedImage] = useState<string>("");
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [isChatClosed, setIsChatClosed] = useState(false);
  const [messageLikes, setMessageLikes] = useState<{
    [key: string]: number;
  }>({});
  const [messageReactions, setMessageReactions] = useState<{
    [key: string]: {
      [emoji: string]: number;
    };
  }>({});
  const [isMinimalTheme, setIsMinimalTheme] = useState(false);
  const [showProfileImageDialog, setShowProfileImageDialog] = useState(false);
  const [showOnlineUsers, setShowOnlineUsers] = useState(false);
  const [showGuestProfile, setShowGuestProfile] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [floatingMessages, setFloatingMessages] = useState<any[]>([]);
  const [isBottomPosition, setIsBottomPosition] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [customChatHeight, setCustomChatHeight] = useState(320); // altura inicial em px
  const [customChatWidth, setCustomChatWidth] = useState(320); // largura inicial em px
  const [isDragging, setIsDragging] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<'height' | 'width' | null>(null);
  
  const isMobile = useIsMobile();

  const {
    controls
  } = useChatControls();
  const {
    config,
    saveConfig
  } = useChatConfiguration();
  const { user } = useGoogleAuth();
  const { onlineUsers } = useOnlinePresence(user?.id || 'global');
  const { blockUser, isUserBlocked } = useBlockedUsers();
  const { isCreator: userIsCreator, canEdit } = useCreatorPermissions(creatorId);
  const { guestData, updateGuestProfile } = useGuestData();
  
  const [guestProfile, setGuestProfile] = useState({
    displayName: guestData.displayName,
    avatarUrl: guestData.avatarUrl,
  });

  useEffect(() => {
    setGuestProfile({
      displayName: guestData.displayName,
      avatarUrl: guestData.avatarUrl,
    });
  }, [guestData.displayName, guestData.avatarUrl]);

  useEffect(() => {
    const handler = (e: any) => {
      const detail = e?.detail || {};
      setGuestProfile(prev => ({
        displayName: detail.displayName ?? prev.displayName ?? guestData.displayName,
        avatarUrl: detail.avatarUrl ?? prev.avatarUrl ?? guestData.avatarUrl,
      }));
    };
    window.addEventListener('guest-profile-updated', handler);
    return () => window.removeEventListener('guest-profile-updated', handler);
  }, []);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profileImageInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Função para scroll automático
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll automático quando novas mensagens chegam
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Force re-render when guest data changes
  useEffect(() => {
    // This ensures the chat re-renders when guest profile is updated
  }, [guestData.displayName, guestData.avatarUrl]);

  // Mouse event handlers for resizing
  const handleMouseDown = (e: React.MouseEvent, direction: 'height' | 'width') => {
    if (!isResizing) return;
    setIsDragging(true);
    setResizeDirection(direction);
    e.preventDefault();
  };

  const handleMouseMove = React.useCallback((e: MouseEvent) => {
    if (!isDragging || !isResizing || !resizeDirection) return;
    
    if (resizeDirection === 'height') {
      const newHeight = window.innerHeight - e.clientY;
      const minHeight = 200;
      const maxHeight = window.innerHeight * 0.8;
      setCustomChatHeight(Math.max(minHeight, Math.min(maxHeight, newHeight)));
    } else if (resizeDirection === 'width') {
      const newWidth = window.innerWidth - e.clientX;
      const minWidth = 280;
      const maxWidth = window.innerWidth * 0.6;
      setCustomChatWidth(Math.max(minWidth, Math.min(maxWidth, newWidth)));
    }
  }, [isDragging, isResizing, resizeDirection]);

  const handleMouseUp = React.useCallback(() => {
    setIsDragging(false);
    setResizeDirection(null);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Verificar se é visitante
  const isVisitor = !user || (creatorId && user.id !== creatorId);
  const isCreator = user && creatorId && user.id === creatorId;

  const handleSendMessage = async () => {
    if (currentMessage.trim()) {
      // Usar o nome atualizado do guest data
      const userName = isCreator 
        ? (config.userName || "Criador") 
        : (guestProfile.displayName || `Guest ${guestData.sessionId.slice(-4)}`);
      
      const newMessage = {
        id: Date.now().toString(),
        username: userName,
        message: currentMessage,
        timestamp: new Date()
      };
      
      // Se está minimizado, adiciona à lista de mensagens flutuantes
      if (isMinimized) {
        setFloatingMessages(prev => [...prev, newMessage].slice(-3)); // Máximo 3 mensagens flutuantes
        // Remove a mensagem flutuante após 5 segundos
        setTimeout(() => {
          setFloatingMessages(prev => prev.filter(msg => msg.id !== newMessage.id));
        }, 5000);
      }
      
      await onSendMessage(userName, currentMessage, config.chatColor, `💬 ${userName}: ${currentMessage}`);
      setCurrentMessage("");
      
      // Scroll automático após enviar
      setTimeout(scrollToBottom, 100);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = e => {
        const imageUrl = e.target?.result as string;
        onSendMessage(config.userName || "You", `<img src="${imageUrl}" alt="Shared image" class="max-w-32 h-20 object-cover rounded cursor-pointer" data-expandable="true" />`, config.chatColor, `📸 ${config.userName || "You"} shared an image`);
        toast.success("📸 Image sent to chat!");
      };
      reader.readAsDataURL(file);
    }
  };
  const startRecording = async () => {
    if (onTrialCheck && !onTrialCheck()) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true
      });
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = event => {
        if (event.data.size > 0) {
          onSendMessage("You", "🎤 Voice message", "text-green-300", "🎤 You sent a voice message");
          toast.success("🎤 Voice message sent!");
        }
      };
      recorder.start();
      mediaRecorder.current = recorder;
      setIsRecording(true);
      setTimeout(() => {
        if (recorder.state === 'recording') {
          stopRecording();
        }
      }, 30000);
    } catch (error) {
      toast.error("❌ Could not access microphone");
    }
  };
  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };
  const handleEditMessage = (message: any) => {
    if (passwordProtected) {
      onPasswordVerify(() => onEditMessage(message));
    } else {
      onEditMessage(message);
    }
  };
  const faceEmojis = ["😀", "😂", "🥰", "😍", "🤔", "😭", "😱", "🤩"];
  const handleEmojiReaction = (messageId: string, emoji: string) => {
    setMessageReactions(prev => ({
      ...prev,
      [messageId]: {
        ...prev[messageId],
        [emoji]: (prev[messageId]?.[emoji] || 0) + 1
      }
    }));
    toast.success(`Reação ${emoji} adicionada!`);
  };
  const handleLikeMessage = (messageId: string) => {
    setMessageLikes(prev => ({
      ...prev,
      [messageId]: (prev[messageId] || 0) + 1
    }));
    toast.success("❤️ Message liked!");
  };
  const handleProfileImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      try {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const newAvatar = e.target?.result as string;
          
            if (isCreator) {
              // Salvar avatar do criador no banco de dados
              await saveConfig({ userAvatar: newAvatar });
              toast.success('✅ Avatar do criador salvo!');
            } else {
               // Usar o hook useGuestData para salvar avatar do visitante
               updateGuestProfile({ avatarUrl: newAvatar });
               setGuestProfile(prev => ({ ...prev, avatarUrl: newAvatar }));
               
               // Also update in guest_profiles table for followers system
               try {
                 await supabase
                   .from('guest_profiles')
                   .upsert({
                     session_id: guestData.sessionId,
                     display_name: guestProfile.displayName || guestData.displayName,
                     avatar_url: newAvatar
                   });
               } catch (error) {
                 console.log('Guest avatar update for followers system:', error);
               }
               
               window.dispatchEvent(new CustomEvent('guest-profile-updated', { 
                 detail: { avatarUrl: newAvatar, sessionId: guestData.sessionId } 
               }));
               toast.success('✅ Avatar do visitante atualizado!');
             }
          
          setShowProfileImageDialog(false);
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Erro no upload:', error);
        toast.error('❌ Erro inesperado no upload');
      }
    }
  };
  const handleImageClick = (event: React.MouseEvent) => {
    const target = event.target as HTMLImageElement;
    if (target.tagName === 'IMG' && target.dataset.expandable) {
      setExpandedImage(target.src);
      setShowImageDialog(true);
    }
  };

  const renderMessage = (msg: any) => {
    if (msg.message.includes('<img')) {
      return <div className="relative inline-block" onClick={handleImageClick}>
          <div dangerouslySetInnerHTML={{
          __html: msg.message
        }} />
          <Button size="sm" className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-black/70 rounded-full" onClick={e => {
          e.stopPropagation();
          const img = e.currentTarget.parentElement?.querySelector('img');
          if (img) {
            setExpandedImage(img.src);
            setShowImageDialog(true);
          }
        }}>
            <Plus className="w-3 h-3 text-white" />
          </Button>
        </div>;
    }
    return <span className="text-gray-300 text-sm">{msg.message}</span>;
  };

  const chatHeight = `${config.chatSize}vh`;
  const chatBackgroundStyle = config.chatBackgroundColor !== "transparent" ? {
    backgroundColor: config.chatBackgroundColor
  } : {};

  // Layout responsivo: chat minimizado (todas as telas)
  if (isMinimized) {
    return (
      <>
        {/* Mensagens flutuantes sobrepostas */}
        <div className="fixed inset-0 pointer-events-none z-40">
          {floatingMessages.map((msg, index) => (
            <div
              key={msg.id}
              className="absolute animate-fade-in pointer-events-none"
              style={{
                top: `${20 + index * 80}px`,
                right: '20px',
                animation: 'fade-in 0.3s ease-out'
              }}
            >
              <div className="bg-primary/90 text-primary-foreground px-4 py-2 rounded-full shadow-lg backdrop-blur-sm max-w-xs">
                <span className="text-xs font-medium">{msg.username}</span>
                <p className="text-sm">{msg.message}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Input minimizado adaptável para todas as telas */}
        <div className={`fixed z-50 bg-background/95 backdrop-blur-sm border p-4 rounded-2xl shadow-lg ${
          isMobile 
            ? 'bottom-0 left-0 right-0 border-t rounded-t-2xl rounded-b-none' 
            : 'bottom-4 right-4 w-80 border rounded-2xl'
        }`}>
          <div className="flex gap-2 items-center">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setIsMinimized(false)}
              className="h-10 w-10 rounded-full"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
            <div className="flex-1 relative">
              <Input 
                value={currentMessage} 
                onChange={e => setCurrentMessage(e.target.value)} 
                onKeyPress={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }} 
                placeholder="Digite uma mensagem..." 
                className="pr-12 rounded-full"
              />
              <Button 
                onClick={handleSendMessage} 
                size="sm" 
                disabled={!currentMessage.trim()} 
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return <div className={`flex flex-col overflow-hidden shadow-xl relative ${config.fleffyMode ? 'bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 border-2 border-pink-200 rounded-3xl shadow-pink-100/50 shadow-2xl' : config.glassMorphism ? 'bg-white/10 backdrop-blur-xl border border-white/30 rounded-2xl shadow-lg' : isMinimalTheme ? 'bg-white border border-gray-200 rounded-xl' : 'bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl'}`} style={{
    height: isBottomPosition ? `${customChatHeight}px` : chatHeight,
    width: !isBottomPosition ? `${customChatWidth}px` : undefined,
    ...chatBackgroundStyle
  }}>
      {/* Resize Bar - show when in bottom position */}
      {isBottomPosition && (
        <div 
          className={`h-1 cursor-ns-resize relative group ${isResizing ? 'bg-primary/60' : 'bg-border/30 hover:bg-primary/40'} transition-colors`}
          onMouseDown={(e) => handleMouseDown(e, 'height')}
          onClick={() => setIsResizing(!isResizing)}
          title={isResizing ? "Clique para fixar tamanho" : "Clique para redimensionar altura"}
        >
          <div className="absolute inset-x-0 -top-1 -bottom-1 group-hover:bg-primary/20 transition-colors" />
          {isResizing && (
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 text-xs text-primary font-medium">
              ↕ Redimensionar Altura
            </div>
          )}
        </div>
      )}

      {/* Width Resize Bar - show when in right position */}
      {!isBottomPosition && (
        <div 
          className={`w-1 cursor-ew-resize absolute right-0 top-0 h-full group ${isResizing ? 'bg-primary/60' : 'bg-border/30 hover:bg-primary/40'} transition-colors z-10`}
          onMouseDown={(e) => handleMouseDown(e, 'width')}
          onClick={() => setIsResizing(!isResizing)}
          title={isResizing ? "Clique para fixar tamanho" : "Clique para redimensionar largura"}
        >
          <div className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-primary/20 transition-colors" />
          {isResizing && (
            <div className="absolute right-0 top-1/2 transform translate-x-full -translate-y-1/2 text-xs text-primary font-medium rotate-90 origin-center">
              ↔ Redimensionar Largura
            </div>
          )}
        </div>
      )}
      
      {/* Header */}
      <div className={`flex items-center justify-between p-2 border-b ${config.fleffyMode ? 'border-pink-200/50 bg-gradient-to-r from-pink-50/80 to-purple-50/80' : isMinimalTheme ? 'border-gray-200 bg-gray-50' : 'border-border/30 bg-muted/30'}`}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className={`text-sm font-medium ${config.fleffyMode ? 'text-pink-700' : isMinimalTheme ? 'text-gray-900' : 'text-foreground'}`}>Chat</span>
          <button 
            onClick={() => setShowOnlineUsers(true)}
            className={`text-xs ${config.fleffyMode ? 'text-purple-600 hover:text-purple-700' : isMinimalTheme ? 'text-gray-500 hover:text-gray-600' : 'text-muted-foreground hover:text-foreground'} transition-colors cursor-pointer hover:underline`}
          >
            ({onlineUsers} online)
          </button>
          
          {/* Ícone discreto para alternar posição */}
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => {
              const newPosition = !isBottomPosition;
              setIsBottomPosition(newPosition);
              onPositionChange?.(newPosition);
              // Reset resize mode when changing position
              setIsResizing(false);
            }}
            className="h-6 w-6 rounded-full hover:bg-muted/50 transition-colors opacity-60 hover:opacity-100"
            title={isBottomPosition ? "Mover para lado direito" : "Mover para baixo da tela"}
          >
            <RotateCcw className="w-3 h-3" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <UserLinkDisplay className="" />
          
          {/* Botão de minimizar para todas as telas */}
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => setIsMinimized(true)}
            className="h-8 w-8 rounded-full hover:bg-muted transition-colors"
            title="Minimizar chat"
          >
            <Minimize2 className="w-4 h-4" />
          </Button>
          
          {(visibilitySettings?.showChatCloseIcon ?? true) && <Button size="sm" variant="ghost" onClick={() => {
          setIsChatClosed(!isChatClosed);
          toast.success(isChatClosed ? "Chat reopened" : "Chat closed");
        }} className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors">
              <DoorOpen className="w-4 h-4" />
            </Button>}
        </div>
      </div>
      
      {!isChatClosed ? <>
          {/* Messages Area */}
          <div 
            ref={messagesContainerRef}
            className={`flex-1 overflow-y-auto p-4 space-y-3 min-h-0 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent hover:scrollbar-thumb-primary/40 ${config.fleffyMode ? 'bg-gradient-to-b from-pink-25/30 to-purple-25/30' : isMinimalTheme ? 'bg-white' : config.glassMorphism ? 'bg-transparent' : 'bg-gray-50'}`}
          >
            {(() => {
              // Verificar se é visitante e se deve ocultar histórico
              const shouldShowMessages = !isVisitor || !config.hideHistoryFromVisitors || messages.length > 0;
              
              if (!shouldShowMessages && isVisitor && messages.length === 0) {
                return (
                  <div className="text-center text-muted-foreground text-sm py-8">
                    <p>Chat vazio - histórico oculto para visitantes</p>
                    <p className="text-xs mt-1">Apenas mensagens novas aparecerão aqui</p>
                  </div>
                );
              }
              
              return messages.map((msg, index) => <div key={msg.id} className="group animate-fade-in" data-message-id={msg.id} style={{
                animationDelay: `${index * 0.1}s`
              }}>
                {/* Layout com distinção entre visitante e criador */}
                <div className={`flex ${
                  // Se é o criador enviando mensagem, alinha à esquerda
                  // Se é visitante enviando mensagem, alinha à direita
                  (msg.username === (config.userName || "Criador")) 
                    ? 'justify-start' : 'justify-end'
                } mb-4`}>
                  <div className={`flex flex-col gap-1 max-w-[70%] ${
                      (msg.username === (config.userName || "Criador"))
                        ? 'items-start' : 'items-end'
                  }`}>
                    {/* Creator Name (only for creator messages and when enabled) */}
                    {config.showCreatorName && msg.username === (config.userName || "Criador") && <div className="flex items-center gap-1 px-2">
                        <Crown className="w-3 h-3 text-yellow-500" />
                        <span className="text-xs text-muted-foreground font-medium">
                          {config.userName || "Criador"}
                        </span>
                      </div>}
                    
                    <div className={`flex items-start gap-3 ${
                      (isCreator && msg.username !== 'Visitante') || (!isCreator && msg.username === (config.userName || "Criador"))
                        ? 'flex-row' : 'flex-row-reverse'
                    }`}>
                        {/* Avatar */}
                      <div className="flex flex-col items-center gap-1">
                        {/* Visitor name above avatar */}
                        {msg.username !== (config.userName || "Criador") && (
                          <span className="text-xs text-muted-foreground font-medium">
                            {guestProfile.displayName || msg.username || 'Visitante'}
                          </span>
                        )}
                        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 relative group">
                          {/* Crown icon for creator */}
                          {msg.username === (config.userName || "Criador") && <Crown className="absolute -top-1 -right-1 w-4 h-4 text-yellow-500 z-10" />}
                          <img 
                            src={
                              msg.username !== (config.userName || "Criador")
                                ? (guestProfile.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=visitor`)
                                : (config.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=creator`)
                            }
                            alt={msg.username !== (config.userName || "Criador") ? 'Visitante' : 'Criador'} 
                            className="w-full h-full object-cover" 
                            onError={e => {
                              e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.username !== (config.userName || "Criador") ? 'visitor' : 'creator'}`;
                            }} 
                          />
                          {/* Permitir visitantes e criadores editarem seus próprios avatares */}
                          {(msg.username === (config.userName || "Criador") ? isCreator : isVisitor) ? <Button
                              size="sm" 
                              variant="ghost" 
                              onClick={() => {
                                if (msg.username === (config.userName || "Criador") && isCreator) {
                                  setShowProfileImageDialog(true);
                                } else if (msg.username !== (config.userName || "Criador") && isVisitor) {
                                  setShowGuestProfile(true);
                                }
                              }}
                              className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 bg-black/50 hover:bg-black/70 rounded-full transition-opacity flex items-center justify-center"
                            >
                              <Edit className="w-3 h-3 text-white" />
                            </Button> : null}
                        </div>
                      </div>
                     
                      {/* Message Bubble */}
                      <div className={`px-4 py-2 rounded-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-lg animate-fade-in ${
                        msg.username !== (config.userName || "Criador") 
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border border-blue-400/50 shadow-blue-500/20' // Visitante - azul com gradiente
                          : 'bg-gradient-to-r from-gray-100 to-gray-50 text-black border border-gray-200 shadow-lg' // Criador - base, cor aplicada abaixo
                      }`} style={msg.username !== (config.userName || "Criador") ? {} : {
                        background: `linear-gradient(135deg, ${config.chatColor}, ${config.chatColor}dd)`,
                        borderColor: `${config.chatColor}40`
                      }}>
                        <div className="text-sm">
                          {msg.message.includes('<img') ? <div className="relative group" onClick={(e) => {
                        const imgElement = e.currentTarget.querySelector('img');
                        if (imgElement) {
                          setExpandedImage(imgElement.src);
                          setShowImageDialog(true);
                        }
                      }}>
                              <div dangerouslySetInnerHTML={{
                        __html: msg.message
                      }} />
                              <Button size="sm" variant="ghost" onClick={(e) => {
                        e.stopPropagation();
                        const imgElement = e.currentTarget.parentElement?.querySelector('img');
                        if (imgElement) {
                          setExpandedImage(imgElement.src);
                          setShowImageDialog(true);
                        }
                      }} className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-black/70 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                <Plus className="w-3 h-3 text-white" />
                              </Button>
                            </div> : msg.message}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>)
            })()}
            {/* Div invisível para scroll automático */}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input Area */}
          <div className={`p-4 border-t ${isMinimalTheme ? 'border-gray-200 bg-gray-50' : 'border-border/30 bg-muted/20'}`}>
            <div className="flex gap-2 items-end">
              {controls.allowImageUpload && <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()} className="h-10 w-10 rounded-full bg-primary/10 border-primary/20 hover:bg-primary/20 transition-colors">
                  <Upload className="w-4 h-4 text-primary" />
                </Button>}
              
              <div className="flex-1 relative">
                <Input 
                  value={currentMessage} 
                  onChange={e => setCurrentMessage(e.target.value)} 
                  onKeyPress={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }} 
                  placeholder="Digite uma mensagem..." 
                  className="pr-12 rounded-full border-border/50 bg-background/80 backdrop-blur-sm focus:border-primary/50 transition-colors" 
                  disabled={isChatClosed} 
                />
                <Button 
                  onClick={handleSendMessage} 
                  size="sm" 
                  disabled={isChatClosed || !currentMessage.trim()} 
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-primary hover:bg-primary/90 disabled:opacity-50 transition-all"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </> : <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
              <DoorOpen className="w-5 h-5 text-muted-foreground" />
            </div>
            <span className="text-sm text-muted-foreground">Chat is closed</span>
          </div>
        </div>}

      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <div className="relative">
            <img src={expandedImage} alt="Expanded" className="w-full h-auto max-h-[80vh] object-contain" />
            <Button className="absolute top-2 right-2 rounded-full p-2 bg-black/50 hover:bg-black/70" onClick={() => setShowImageDialog(false)}>
              <X className="w-4 h-4 text-white" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showProfileImageDialog} onOpenChange={setShowProfileImageDialog}>
        <DialogContent className="sm:max-w-lg">
          <div className="flex flex-col items-center space-y-4 p-6">
            <h3 className="text-lg font-semibold">Configurações de Perfil</h3>
            
            {/* User Name Configuration */}
            <div className="w-full space-y-2">
              <Label htmlFor="userName" className="text-sm font-medium">Nome do Usuário</Label>
              <Input
                id="userName"
                value={isCreator ? (config.userName || '') : (guestData.displayName || '')}
                onChange={async (e) => {
                  const newName = e.target.value;
                  if (isCreator) {
                    await saveConfig({ userName: newName });
                  } else {
                    // Update guest profile for followers system
                    updateGuestProfile({ displayName: newName });
                    setGuestProfile(prev => ({ ...prev, displayName: newName }));
                    
                    // Ensure the name is immediately saved to guest_profiles
                    if (newName.trim()) {
                      try {
                        const { error } = await supabase
                          .from('guest_profiles')
                          .upsert({
                            session_id: guestData.sessionId,
                            display_name: newName.trim(),
                            avatar_url: guestProfile.avatarUrl || guestData.avatarUrl
                          }, { 
                            onConflict: 'session_id' 
                          });

                        if (error) {
                          console.error('Error updating guest profile:', error);
                        } else {
                          console.log('✅ Guest profile updated successfully:', newName);
                        }
                      } catch (error) {
                        console.error('Failed to update guest profile:', error);
                      }
                    }
                    
                    // Dispatch event for other components
                    window.dispatchEvent(new CustomEvent('guest-profile-updated', { 
                      detail: { displayName: newName, sessionId: guestData.sessionId } 
                    }));
                  }
                }}
                placeholder={isCreator ? "Nome do criador" : "Seu nome"}
                className="w-full"
              />
            </div>
            
            {/* Current Avatar Preview */}
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-border">
              <img src={
                isCreator 
                  ? config.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=creator`
                  : guestProfile.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=visitor`
              } alt="Avatar atual" className="w-full h-full object-cover" />
            </div>

            {/* Default Avatar Options */}
            <div className="w-full">
              <h4 className="text-sm font-medium mb-3 text-center">Escolha um avatar padrão:</h4>
              <div className="grid grid-cols-4 gap-3">
                {['happy', 'smile', 'cool', 'cute', 'fun', 'sweet', 'star', 'magic', 'sunny', 'ocean', 'forest', 'galaxy'].map(seed => <button key={seed} onClick={async () => {
                const newAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
                
                 if (isCreator) {
                   // Salvar avatar do criador no banco de dados
                   await saveConfig({ userAvatar: newAvatar });
                   toast.success('✅ Avatar do criador salvo!');
                 } else {
                   // Usar o hook useGuestData para salvar avatar do visitante
                   updateGuestProfile({ avatarUrl: newAvatar });
                   setGuestProfile(prev => ({ ...prev, avatarUrl: newAvatar }));
                   
                   // Also update in guest_profiles table for followers system
                   try {
                     await supabase
                       .from('guest_profiles')
                       .upsert({
                         session_id: guestData.sessionId,
                         display_name: guestProfile.displayName || guestData.displayName,
                         avatar_url: newAvatar
                       });
                   } catch (error) {
                     console.log('Guest avatar update for followers system:', error);
                   }
                   
                   window.dispatchEvent(new CustomEvent('guest-profile-updated', { 
                     detail: { avatarUrl: newAvatar, sessionId: guestData.sessionId } 
                   }));
                   toast.success('✅ Avatar do visitante atualizado!');
                 }
                
                setShowProfileImageDialog(false);
              }} className="w-12 h-12 rounded-full overflow-hidden border-2 border-transparent hover:border-primary transition-all hover:scale-110">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`} alt={`Avatar ${seed}`} className="w-full h-full object-cover" />
                  </button>)}
              </div>
            </div>

            {/* Upload Custom Photo */}
            <div className="w-full border-t pt-4">
              
              <input ref={profileImageInputRef} type="file" accept="image/*" className="hidden" onChange={handleProfileImageUpload} />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Guest Profile Dialog */}
      <GuestProfileDialog 
        isOpen={showGuestProfile}
        onClose={() => setShowGuestProfile(false)}
      />

      {/* Online Users Dialog */}
      <OnlineUsersDialog 
        open={showOnlineUsers}
        onOpenChange={setShowOnlineUsers}
        onlineCount={onlineUsers}
        creatorId={creatorId}
      />
    </div>;
};

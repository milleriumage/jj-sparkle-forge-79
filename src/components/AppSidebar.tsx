import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  MessageSquare, 
  Bell, 
  Bookmark, 
  User,
  ChevronRight,
  Lock,
  Timer,
  Moon,
  Sun,
  Store,
  Heart,
  CreditCard,
  Users,
  LayoutDashboard,
  Settings,
  Languages,
  Eye,
  Database,
  ShoppingBag,
  UserCog
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import { SettingsDialog } from '@/components/SettingsDialog';
import { LanguageSelector } from '@/components/LanguageSelector';
import { VisibilitySettingsDialog } from '@/components/VisibilitySettingsDialog';
import { WishlistDialog } from '@/components/WishlistDialog';
import { ReferralDialog } from '@/components/ReferralDialog';
import { ProfileDialog } from '@/components/ProfileDialog';
import { PaymentMethodsDialog } from '@/components/PaymentMethodsDialog';
import { SalesHistoryModal } from '@/components/SalesHistoryModal';
import { PasswordDialog } from '@/components/PasswordDialog';
import { MediaTimerDialog } from '@/components/MediaTimerDialog';
import { useLanguage } from '@/hooks/useLanguage';
import { toast } from 'sonner';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

interface NavItem {
  id: string;
  icon: React.ComponentType<any>;
  label: string;
  path?: string;
  action?: () => void;
  isDarkMode?: boolean;
  isToggle?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}


export const AppSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { open, setOpen } = useSidebar();
  const { theme, setTheme } = useTheme();
  
  // Estado para controlar os dialogs
  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  const { language, setLanguage } = useLanguage();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const isActive = (path: string) => location.pathname === path;

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const openDialog = (dialogId: string) => {
    setActiveDialog(dialogId);
  };

  const closeDialog = () => {
    setActiveDialog(null);
  };

  // Definindo as seções da navegação
  const navSections: NavSection[] = [
    {
      title: "Navigation",
      items: [
        {
          id: 'home',
          icon: Home,
          label: 'Home',
          path: '/'
        },
        {
          id: 'dashboard',
          icon: LayoutDashboard,
          label: 'Painel do Usuário',
          path: '/dashboard'
        },
        {
          id: 'topics',
          icon: FileText,
          label: 'Topics',
          path: '/mylay'
        },
        {
          id: 'messages',
          icon: MessageSquare,
          label: 'Messages',
          path: '/dashboard'
        }
      ]
    },
    {
      title: "Activity",
      items: [
        {
          id: 'notifications',
          icon: Bell,
          label: 'Notifications',
          action: () => toast.info('Notifications feature available in the main app')
        },
        {
          id: 'timer',
          icon: Timer,
          label: 'Cronômetro',
          action: () => openDialog('timer')
        },
        {
          id: 'lock',
          icon: Lock,
          label: 'Cadeado',
          action: () => openDialog('password')
        }
      ]
    },
    {
      title: "Commerce",
      items: [
        {
          id: 'sales',
          icon: Store,
          label: 'Central de Vendas',
          action: () => openDialog('sales')
        },
        {
          id: 'payment',
          icon: CreditCard,
          label: 'Pagamento',
          action: () => openDialog('payment')
        },
        {
          id: 'wishlist',
          icon: Heart,
          label: 'Wishlist',
          action: () => openDialog('wishlist')
        }
      ]
    },
    {
      title: "Profile",
      items: [
        {
          id: 'profile',
          icon: User,
          label: 'Profile',
          action: () => openDialog('profile')
        },
        {
          id: 'referral',
          icon: Users,
          label: 'Referral Page',
          action: () => openDialog('referral')
        },
        {
          id: 'bookmarks',
          icon: Bookmark,
          label: 'Bookmarks',
          path: '/mylistpage'
        }
      ]
    },
    {
      title: "Settings",
      items: [
        {
          id: 'darkmode',
          icon: theme === 'dark' ? Sun : Moon,
          label: 'Dark Mode',
          action: toggleTheme,
          isDarkMode: true
        },
        {
          id: 'settings',
          icon: Settings,
          label: 'Configurações',
          action: () => openDialog('settings')
        },
        {
          id: 'language',
          icon: Languages,
          label: 'Select Language',
          action: () => {
            const newLang = language === 'pt' ? 'en' : 'pt';
            setLanguage(newLang);
            toast.success(`Language changed to ${newLang === 'pt' ? 'Portuguese' : 'English'}`);
          }
        },
        {
          id: 'visibility',
          icon: Eye,
          label: 'Visibility Settings',
          action: () => openDialog('visibility')
        },
        {
          id: 'storage',
          icon: Database,
          label: 'External Storage',
          action: () => toast.info('External storage configuration available in Settings')
        }
      ]
    }
  ];

  return (
    <Sidebar 
      className={cn(
        "fixed left-0 top-0 h-screen z-50 transition-all duration-300 ease-in-out",
        "bg-background/95 backdrop-blur-md border-r border-border/50 shadow-lg",
        open ? "w-64" : "w-16"
      )}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <SidebarContent className="p-0">
        {/* User Profile Section - Only visible when expanded */}
        {open && (
          <div className="p-4 border-b border-border/50">
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src="/assets/user-avatar.png" />
                <AvatarFallback>SR</AvatarFallback>
              </Avatar>
              <div className="animate-fade-in">
                <p className="font-semibold text-sm">Sophia Rose</p>
                <p className="text-xs text-muted-foreground">UX/UI Designer</p>
              </div>
            </div>
          </div>
        )}

        {navSections.map((section) => (
          <SidebarGroup key={section.title} className="px-2 py-2">
            {open && (
              <div className="px-3 py-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {section.title}
                </h3>
              </div>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = item.path ? isActive(item.path) : false;
                  const onClick = item.path ? () => handleNavigation(item.path) : item.action;
                  
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={onClick}
                        className={cn(
                          "w-full h-11 px-3 rounded-lg transition-all duration-200",
                          "hover:bg-accent/50 active:scale-95",
                          "flex items-center justify-start",
                          active && "bg-primary/10 text-primary border border-primary/20",
                          item.isDarkMode && "hover:bg-primary/10",
                          !open && "justify-center px-2"
                        )}
                      >
                        <div className="flex items-center space-x-3 w-full">
                          <Icon 
                            size={18} 
                            className={cn(
                              "flex-shrink-0 transition-colors",
                              active ? "text-primary" : "text-muted-foreground",
                              item.isDarkMode && "text-primary"
                            )}
                          />
                          {open && (
                            <span 
                              className={cn(
                                "font-medium text-sm animate-fade-in transition-colors",
                                active ? "text-primary" : "text-foreground"
                              )}
                            >
                              {item.label}
                            </span>
                          )}
                          {open && active && (
                            <ChevronRight size={14} className="text-primary ml-auto" />
                          )}
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      
      {/* Dialogs - Only functional ones */}
      {activeDialog === 'settings' && (
        <SettingsDialog 
          onImageUpload={(file) => toast.success('Image uploaded!')}
          onVideoUpload={(file) => toast.success('Video uploaded!')}
          onSaveState={() => toast.success('State saved!')}
          onLoadState={() => toast.success('State loaded!')}
        />
      )}
      {activeDialog === 'visibility' && (
        <VisibilitySettingsDialog 
          open={true}
          onOpenChange={closeDialog}
        />
      )}
      {activeDialog === 'wishlist' && (
        <WishlistDialog 
          open={true}
          onOpenChange={closeDialog}
        />
      )}
      {activeDialog === 'referral' && (
        <ReferralDialog />
      )}
      {activeDialog === 'profile' && (
        <ProfileDialog 
          masterPassword=""
          passwordSet={false}
          onPasswordSet={() => {}}
          onPasswordRemove={() => {}}
        />
      )}
      {activeDialog === 'payment' && (
        <PaymentMethodsDialog 
          isOpen={true}
          onClose={closeDialog}
        />
      )}
      {activeDialog === 'sales' && (
        <SalesHistoryModal 
          open={true}
          onOpenChange={closeDialog}
        />
      )}
      {activeDialog === 'password' && (
        <PasswordDialog 
          isOpen={true}
          onClose={closeDialog}
          mode="set"
        />
      )}
      {activeDialog === 'timer' && (
        <MediaTimerDialog 
          isOpen={true}
          onClose={closeDialog}
          onSetTimer={() => {}}
          onResetTimer={() => {}}
          mediaId="sidebar-timer"
        />
      )}
    </Sidebar>
  );
};
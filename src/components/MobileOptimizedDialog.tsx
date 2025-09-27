import React from 'react';
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

const MobileOptimizedDialog = DialogPrimitive.Root;

const MobileOptimizedDialogTrigger = DialogPrimitive.Trigger;

const MobileOptimizedDialogPortal = DialogPrimitive.Portal;

const MobileOptimizedDialogClose = DialogPrimitive.Close;

const MobileOptimizedDialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
MobileOptimizedDialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const MobileOptimizedDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    showCloseButton?: boolean;
  }
>(({ className, children, showCloseButton = true, ...props }, ref) => {
  const isMobile = useIsMobile();

  return (
    <MobileOptimizedDialogPortal>
      <MobileOptimizedDialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          // Base styles
          "fixed z-50 grid gap-4 bg-background shadow-lg duration-300",
          // Mobile-first responsive design
          isMobile ? [
            // Mobile: Full screen bottom sheet
            "inset-x-0 bottom-0 top-auto",
            "rounded-t-3xl border-t",
            "max-h-[85vh] min-h-[50vh]",
            "p-6 pb-8",
            "data-[state=open]:slide-in-from-bottom-full",
            "data-[state=closed]:slide-out-to-bottom-full",
            "data-[state=open]:animate-in",
            "data-[state=closed]:animate-out"
          ] : [
            // Desktop: Centered modal
            "left-[50%] top-[50%]",
            "translate-x-[-50%] translate-y-[-50%]",
            "w-full max-w-lg",
            "rounded-lg border p-6",
            "data-[state=open]:zoom-in-95",
            "data-[state=closed]:zoom-out-95",
            "data-[state=open]:slide-in-from-left-1/2",
            "data-[state=open]:slide-in-from-top-[48%]",
            "data-[state=closed]:slide-out-to-left-1/2",
            "data-[state=closed]:slide-out-to-top-[48%]",
            "data-[state=open]:animate-in",
            "data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0",
            "data-[state=open]:fade-in-0"
          ],
          className
        )}
        {...props}
      >
        {/* Mobile: Drag indicator */}
        {isMobile && (
          <div className="mx-auto w-12 h-1.5 bg-muted rounded-full mb-4" />
        )}
        
        {children}
        
        {/* Close button - positioned differently for mobile/desktop */}
        {showCloseButton && (
          <DialogPrimitive.Close className={cn(
            "absolute rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none",
            isMobile 
              ? "right-6 top-6 h-8 w-8" 
              : "right-4 top-4 h-6 w-6"
          )}>
            <X className={isMobile ? "h-5 w-5" : "h-4 w-4"} />
            <span className="sr-only">Fechar</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </MobileOptimizedDialogPortal>
  );
});
MobileOptimizedDialogContent.displayName = DialogPrimitive.Content.displayName;

const MobileOptimizedDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const isMobile = useIsMobile();
  
  return (
    <div
      className={cn(
        "flex flex-col space-y-1.5 text-center sm:text-left",
        isMobile && "text-center pb-4",
        className
      )}
      {...props}
    />
  );
};
MobileOptimizedDialogHeader.displayName = "MobileOptimizedDialogHeader";

const MobileOptimizedDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const isMobile = useIsMobile();
  
  return (
    <div
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
        isMobile && "flex-col space-y-2 pt-4",
        className
      )}
      {...props}
    />
  );
};
MobileOptimizedDialogFooter.displayName = "MobileOptimizedDialogFooter";

const MobileOptimizedDialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => {
  const isMobile = useIsMobile();
  
  return (
    <DialogPrimitive.Title
      ref={ref}
      className={cn(
        "font-semibold leading-none tracking-tight",
        isMobile ? "text-xl" : "text-lg",
        className
      )}
      {...props}
    />
  );
});
MobileOptimizedDialogTitle.displayName = DialogPrimitive.Title.displayName;

const MobileOptimizedDialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
MobileOptimizedDialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  MobileOptimizedDialog,
  MobileOptimizedDialogPortal,
  MobileOptimizedDialogOverlay,
  MobileOptimizedDialogClose,
  MobileOptimizedDialogTrigger,
  MobileOptimizedDialogContent,
  MobileOptimizedDialogHeader,
  MobileOptimizedDialogFooter,
  MobileOptimizedDialogTitle,
  MobileOptimizedDialogDescription,
};
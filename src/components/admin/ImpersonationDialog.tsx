import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LogIn, Info } from 'lucide-react';

interface ImpersonationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string | null;
  userType: string;
  onConfirm: () => void;
}

export function ImpersonationDialog({
  open,
  onOpenChange,
  userName,
  userType,
  onConfirm
}: ImpersonationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Login as {userName || 'User'}</DialogTitle>
          <DialogDescription>
            How to impersonate this {userType} user
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              User impersonation requires manual login for security. Follow these steps:
            </AlertDescription>
          </Alert>
          
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>This will set up impersonation tracking</li>
            <li>You'll see the yellow impersonation banner</li>
            <li>Use the Dev Tools to login as a {userType}</li>
            <li>When done, click "Exit Impersonation" in the banner</li>
          </ol>
          
          <div className="bg-muted p-3 rounded text-sm">
            <p className="font-medium">Security Note:</p>
            <p className="text-muted-foreground">
              True user impersonation requires backend implementation for security.
              This is a development-only feature.
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>
            <LogIn className="h-4 w-4 mr-2" />
            Set Up Impersonation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
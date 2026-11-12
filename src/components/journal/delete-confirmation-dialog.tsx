"use client";

import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useApp } from '@/components/providers/app-provider';

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPermanent?: boolean;
}

export default function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  isPermanent = false,
}: DeleteConfirmationDialogProps) {
  const { t } = useApp();

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="dream-glass sm:rounded-2xl border-border/80">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-headline text-lg">
            {isPermanent ? t.deletePermanently : t.deleteConfirmTitle}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground">
            {isPermanent ? t.permanentDeleteDesc : t.deleteConfirmDesc}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel onClick={onClose} className="rounded-xl">
            {t.cancel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-sm"
          >
            {isPermanent ? t.deletePermanently : t.delete}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

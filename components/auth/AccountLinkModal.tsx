"use client";

import { Link2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

/**
 * FR-AUTH-8: when a Google sign-in uses an email that already has an
 * email/password account, offer account linking instead of duplicating.
 */
export function AccountLinkModal({
  email,
  onLink,
  onCancel,
}: {
  email: string;
  onLink: () => void;
  onCancel: () => void;
}) {
  return (
    <Dialog open onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="max-w-sm rounded-2xl">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary-soft text-primary">
          <Link2 size={22} />
        </div>

        <DialogHeader>
          <DialogTitle className="text-lg">Link your account</DialogTitle>
          <DialogDescription className="text-body">
            An account with{" "}
            <span className="font-semibold text-foreground">{email}</span> already
            exists. Link your Google login to it so you keep one account instead of
            creating a duplicate.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-2 gap-3 sm:gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            className="h-11 flex-1 rounded-xl"
          >
            Cancel
          </Button>
          <Button onClick={onLink} className="h-11 flex-1 rounded-xl">
            Link account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

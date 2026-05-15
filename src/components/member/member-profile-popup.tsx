"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageSquare, ShieldCheck, Calendar } from "lucide-react";

type ProfileData = {
  userId: number;
  name: string;
  role: string;
  subtitle?: string;
  joinedAt?: string;
  loanCount?: number;
  trustTier?: string;
};

export function MemberProfilePopup({
  profile,
  open,
  onOpenChange,
  onStartConversation,
}: {
  profile: ProfileData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartConversation: (userId: number) => void;
}) {
  if (!profile) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm rounded-3xl border-0 p-0 gap-0 overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 text-center">
          <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/15 text-3xl font-black text-white backdrop-blur ring-4 ring-white/10">
            {profile.name.substring(0, 2).toUpperCase()}
          </div>
          <DialogTitle className="text-xl font-bold text-white">
            {profile.name}
          </DialogTitle>
          <p className="text-sm text-slate-300 capitalize">{profile.role}</p>
        </div>
        <div className="p-6 space-y-4">
          {profile.subtitle && (
            <p className="text-sm text-slate-600 text-center">{profile.subtitle}</p>
          )}
          <div className="grid grid-cols-2 gap-3">
            {profile.trustTier && (
              <div className="rounded-2xl bg-blue-50 p-3 text-center">
                <ShieldCheck className="mx-auto h-5 w-5 text-blue-600" />
                <p className="mt-1 text-lg font-bold text-blue-700">
                  {profile.trustTier}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-blue-500">
                  Trust Tier
                </p>
              </div>
            )}
            {profile.loanCount !== undefined && (
              <div className="rounded-2xl bg-amber-50 p-3 text-center">
                <Calendar className="mx-auto h-5 w-5 text-amber-600" />
                <p className="mt-1 text-lg font-bold text-amber-700">
                  {profile.loanCount}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-amber-500">
                  Loans
                </p>
              </div>
            )}
            {profile.joinedAt && (
              <div className="rounded-2xl bg-slate-50 p-3 text-center">
                <Calendar className="mx-auto h-5 w-5 text-slate-600" />
                <p className="mt-1 text-lg font-bold text-slate-700">
                  {profile.joinedAt}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-slate-500">
                  Member Since
                </p>
              </div>
            )}
          </div>
          <Button
            className="w-full rounded-xl"
            onClick={() => {
              onStartConversation(profile.userId);
              onOpenChange(false);
            }}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Send Message
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

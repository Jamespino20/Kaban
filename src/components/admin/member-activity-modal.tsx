"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AuditLogViewer } from "./audit-log-viewer";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MemberActivityModalProps {
  member: any;
  isOpen: boolean;
  onClose: () => void;
}

export function MemberActivityModal({
  member,
  isOpen,
  onClose,
}: MemberActivityModalProps) {
  if (!member) return null;

  const profile = member.profile || {};
  const name = profile.first_name ? `${profile.first_name} ${profile.last_name}` : member.username;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[85vh] p-0 overflow-hidden flex flex-col rounded-3xl border-slate-200">
        <DialogHeader className="p-6 bg-slate-50/50 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200">
                <DialogTitle className="sr-only">Activity Log</DialogTitle>
                <div className="font-black text-xs uppercase">{name.substring(0, 2)}</div>
             </div>
             <div>
                <h3 className="text-xl font-display font-bold italic text-slate-950">Activity Log</h3>
                <p className="text-sm text-slate-500">System interactions and audit history for {name}</p>
             </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden p-6 bg-white">
           <ScrollArea className="h-full pr-4">
              <AuditLogViewer 
                userId={member.user_id} 
                tenantId={member.tenant_id} 
              />
           </ScrollArea>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 shrink-0 flex justify-end">
          <button 
            className="px-6 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

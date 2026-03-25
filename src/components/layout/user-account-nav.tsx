"use client";

import { signOut } from "next-auth/react";
import { LogOut, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export function UserAccountNav({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex flex-col items-end hidden md:flex">
        <span className="text-sm font-bold text-slate-900">{name}</span>
        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
          Account
        </span>
      </div>
      <div className="h-10 w-px bg-slate-200 mx-2 hidden md:block" />
      <Button
        variant="ghost"
        size="icon"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="size-10 rounded-full hover:bg-red-50 hover:text-red-600 transition-colors"
        title="Sign Out"
      >
        <LogOut className="w-5 h-5" />
      </Button>
    </div>
  );
}

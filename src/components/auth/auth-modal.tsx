"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "@/components/auth/login-form";
import { EnhancedRegisterForm } from "@/components/auth/enhanced-register-form";
import { Button } from "@/components/ui/button";

export function AuthModal() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 px-8 rounded-full shadow-lg shadow-emerald-900/20 transition-all">
          Buksan ang Asenso (Get Started)
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[750px] bg-white border-slate-200 p-0 rounded-3xl overflow-hidden overflow-y-auto max-h-[95vh] border-none shadow-none">
        <DialogTitle className="sr-only">Authentication</DialogTitle>
        <DialogDescription className="sr-only">
          Login or register to access the treasury
        </DialogDescription>

        <Tabs defaultValue="login" className="w-full">
          <div className="px-8 pt-8">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-slate-100 p-1 rounded-xl">
              <TabsTrigger
                value="login"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm py-2"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm py-2"
              >
                Register
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            value="login"
            className="focus-visible:outline-none focus-visible:ring-0 outline-none px-8 pb-8"
          >
            <LoginForm />
          </TabsContent>
          <TabsContent
            value="register"
            className="focus-visible:outline-none focus-visible:ring-0 outline-none"
          >
            <EnhancedRegisterForm />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

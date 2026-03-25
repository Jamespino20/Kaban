"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ShieldCheck, ShieldAlert, QrCode, Key, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  generate2FASecret,
  verifyAndEnable2FA,
  disable2FA,
} from "@/actions/2fa";

export function TwoFactorSetup({
  isEnabledInitial,
}: {
  isEnabledInitial: boolean;
}) {
  const [isEnabled, setIsEnabled] = useState(isEnabledInitial);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [token, setToken] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleStartSetup = async () => {
    startTransition(async () => {
      const res = await generate2FASecret();
      if (res.error) {
        toast.error(res.error);
        return;
      }
      setQrCode(res.qrCodeUrl!);
      setSecret(res.secret!);
      setIsSettingUp(true);
    });
  };

  const handleVerify = async () => {
    startTransition(async () => {
      const res = await verifyAndEnable2FA(token);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(res.success);
        setIsEnabled(true);
        setIsSettingUp(false);
      }
    });
  };

  const handleDisable = async () => {
    startTransition(async () => {
      const res = await disable2FA();
      if (res.success) {
        toast.success(res.success);
        setIsEnabled(false);
        setIsSettingUp(false);
      }
    });
  };

  return (
    <Card className="p-8 w-full max-w-md border-slate-200/60 shadow-lg rounded-3xl bg-white/50 backdrop-blur-md">
      <div className="flex flex-col items-center text-center space-y-6">
        <div
          className={`w-20 h-20 rounded-[2rem] flex items-center justify-center transition-all ${isEnabled ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"}`}
        >
          {isEnabled ? (
            <ShieldCheck className="w-10 h-10" />
          ) : (
            <ShieldAlert className="w-10 h-10" />
          )}
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl font-display font-bold text-slate-900 italic">
            Google Authenticator (2FA)
          </h3>
          <p className="text-slate-500 text-sm">
            {isEnabled
              ? "Protektado ang iyong account gamit ang two-factor authentication."
              : "Dagdagan ang seguridad ng iyong account gamit ang TOTP 2FA."}
          </p>
        </div>

        {isEnabled ? (
          <Button
            disabled={isPending}
            variant="destructive"
            onClick={handleDisable}
            className="rounded-xl h-12 w-full font-bold"
          >
            I-disable ang 2FA
          </Button>
        ) : !isSettingUp ? (
          <Button
            disabled={isPending}
            onClick={handleStartSetup}
            className="rounded-xl h-12 w-full bg-slate-900 hover:bg-emerald-600 transition-all font-bold text-white"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Simulan ang Setup"
            )}
          </Button>
        ) : (
          <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm inline-block mx-auto">
              {qrCode && (
                <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
              )}
            </div>

            <div className="space-y-4 text-left">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">
                  Manual Entry Key
                </p>
                <code className="block text-center bg-slate-100 p-2 rounded-lg text-xs font-mono select-all">
                  {secret}
                </code>
              </div>

              <div className="space-y-4">
                <Input
                  placeholder="Ipasok ang 6-digit code"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="rounded-xl h-12 text-center text-xl tracking-[0.5em] font-bold"
                  maxLength={6}
                />
                <Button
                  disabled={isPending || token.length < 6}
                  onClick={handleVerify}
                  className="w-full rounded-xl h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Verify at I-enable
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

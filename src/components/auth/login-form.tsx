"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import {
  Eye,
  EyeOff,
  Building2,
  User,
  Lock,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { getAvailableTenants } from "@/actions/identity";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const LoginSchema = z.object({
  tenantId: z.string().optional(), // Becomes required in step 2
  username: z.string().min(1, "Kailangan ng username"),
  password: z.string().min(1, "Kailangan ng password"),
  code: z.string().optional(),
});

type LoginStep = "credentials" | "tenant" | "2fa";

export const LoginForm = () => {
  const [step, setStep] = useState<LoginStep>("credentials");
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [availableTenants, setAvailableTenants] = useState<any[]>([]);

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      tenantId: "",
      username: "",
      password: "",
      code: "",
    },
  });

  const onIdentify = (values: z.infer<typeof LoginSchema>) => {
    startTransition(async () => {
      const res = await getAvailableTenants(values.username, values.password);

      if (res.error) {
        toast.error(res.error);
        return;
      }

      if (res.tenants && res.tenants.length > 0) {
        if (res.tenants.length === 1) {
          // Auto-select if only one tenant
          const tId = res.tenants[0].tenant_id?.toString() || "global";
          form.setValue("tenantId", tId);
          performLogin({ ...values, tenantId: tId });
        } else {
          setAvailableTenants(res.tenants);
          setStep("tenant");
        }
      }
    });
  };

  const performLogin = (values: z.infer<typeof LoginSchema>) => {
    startTransition(async () => {
      try {
        const result = await signIn("credentials", {
          tenantId: values.tenantId,
          username: values.username,
          password: values.password,
          code: values.code,
          redirect: false,
        });

        if (result?.error) {
          if (result.error === "2FA_REQUIRED") {
            setStep("2fa");
            toast.info("I-enter ang 2FA code.");
          } else {
            toast.error("Maling credentials or access denied.");
            // If it failed at final login, maybe reset to step 1
            if (step === "tenant" || step === "2fa") {
              // Stay here, but clear code
              form.setValue("code", "");
            }
          }
        } else {
          toast.success("Mabuhay! Login successful.");
          window.location.href = "/"; // Force refresh to let proxy handle routing
        }
      } catch (error) {
        toast.error("Nagkaroon ng error habang nag-login.");
      }
    });
  };

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    if (step === "credentials") {
      onIdentify(values);
    } else {
      if (!values.tenantId && step === "tenant") {
        toast.error("Pumili ng branch.");
        return;
      }
      performLogin(values);
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col space-y-2 text-center mb-8">
        <h1 className="text-3xl font-display font-bold italic tracking-tight text-emerald-900">
          Mag-login na sa Agapay
        </h1>
        <p className="text-sm text-slate-500">
          {step === "credentials" &&
            "Punan ang iyong credentials para sa account mo"}
          {step === "tenant" && "Piliin ang branch na iyong i-aaccess"}
          {step === "2fa" && "Kinakailangan ang second-factor authentication"}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {step === "credentials" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username / Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          {...field}
                          disabled={isPending}
                          placeholder="juan.agapay"
                          className="rounded-xl h-12 pl-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-emerald-500"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          {...field}
                          disabled={isPending}
                          placeholder="******"
                          type={showPassword ? "text" : "password"}
                          className="rounded-xl h-12 pl-11 pr-10 bg-slate-50 border-slate-200 focus:bg-white focus:border-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {step === "tenant" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                Available Branches
              </p>
              <div className="grid grid-cols-1 gap-3">
                {availableTenants.map((tenant: any) => (
                  <button
                    key={tenant.tenant_id || "global"}
                    type="button"
                    onClick={() => {
                      form.setValue(
                        "tenantId",
                        tenant.tenant_id?.toString() || "global",
                      );
                      form.handleSubmit(onSubmit)();
                    }}
                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all group ${
                      form.watch("tenantId") ===
                      (tenant.tenant_id?.toString() || "global")
                        ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/10"
                        : "border-slate-100 hover:border-emerald-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-900">{tenant.name}</p>
                      <p className="text-xs text-slate-500 font-medium">
                        {tenant.groupName}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
              <Button
                variant="ghost"
                onClick={() => setStep("credentials")}
                className="w-full text-slate-500 hover:text-slate-700"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Teka, hindi and account na ito?
              </Button>
            </div>
          )}

          {step === "2fa" && (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Security Verification Code (2FA)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder="123456"
                        className="rounded-xl h-14 text-center text-2xl font-black tracking-[0.5em] border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {step !== "tenant" && (
            <Button
              disabled={isPending}
              type="submit"
              className="w-full rounded-xl h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg shadow-lg shadow-emerald-500/20 transition-all mt-4 group"
            >
              {isPending ? (
                "Connecting..."
              ) : step === "credentials" ? (
                <>
                  Next Step
                  <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              ) : (
                "Iverify at Sign In"
              )}
            </Button>
          )}
        </form>
      </Form>
    </div>
  );
};

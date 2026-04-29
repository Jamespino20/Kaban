"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTransition, Suspense } from "react";
import { newPassword } from "@/actions/new-password";
import { toast } from "sonner";
import { Lock, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

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

const NewPasswordSchema = z.object({
  password: z.string().min(6, {
    message: "Kailangan ng 6 na karakter pataas",
  }),
});

function NewPasswordFormInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof NewPasswordSchema>>({
    resolver: zodResolver(NewPasswordSchema),
    defaultValues: {
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof NewPasswordSchema>) => {
    startTransition(() => {
      newPassword(values, token)
        .then((data) => {
          if (data?.error) {
            toast.error(data.error);
          }
          if (data?.success) {
            toast.success(data.success);
            form.reset();
            window.location.href = "/auth/login";
          }
        })
        .catch(() => toast.error("May nangyaring mali."));
    });
  };

  return (
    <div className="space-y-6 w-full p-8 bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)]">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          I-reset ang Password
        </h1>
        <p className="text-sm text-slate-500">
          I-type ang bago mong password para sa Agapay. Makakabalik ka na sa
          iyong account pagkatapos nito.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700">
                  Bagong Password
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder="******"
                      type="password"
                      className="pl-10 h-12 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-1 focus-visible:ring-emerald-500"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isPending}
            className="w-full h-12 rounded-xl text-base font-medium shadow-sm transition-all bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Palitan ang Password"
            )}
          </Button>
        </form>
      </Form>

      <div className="text-center">
        <Link
          href="/auth/login"
          className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-emerald-600"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Bumalik sa Login
        </Link>
      </div>
    </div>
  );
}

export const NewPasswordForm = () => {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <NewPasswordFormInner />
    </Suspense>
  );
};

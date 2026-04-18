"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useTransition, useEffect } from "react";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { getTenants } from "@/actions/tenant";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  tenantId: z.string().min(1, {
    message: "Cooperative branch is required",
  }),
  username: z.string().min(1, {
    message: "Username is required",
  }),
  password: z.string().min(1, {
    message: "Password is required",
  }),
  code: z.string().optional(),
});

export const LoginForm = () => {
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [tenants, setTenants] = useState<
    Awaited<ReturnType<typeof getTenants>>
  >([]);

  useEffect(() => {
    getTenants().then(setTenants);
  }, []);

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      tenantId: "",
      username: "",
      password: "",
      code: "",
    },
  });

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
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
            setShowTwoFactor(true);
            toast.info("Please enter your 2FA code.");
          } else {
            toast.error("Invalid credentials.");
            form.reset({ ...values, password: "" });
          }
        } else {
          toast.success("Login successful!");
          window.location.reload(); // Refresh to let proxy handle routing
        }
      } catch (error) {
        toast.error("Something went wrong.");
      }
    });
  };

  return (
    <div className="w-full">
      <div className="flex flex-col space-y-2 text-center mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Access Treasury
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your credentials to manage your Agapay
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {showTwoFactor && (
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>2FA Code</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder="123456"
                      className="rounded-xl h-12 border-emerald-200 focus:border-emerald-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          {!showTwoFactor && (
            <>
              <FormField
                control={form.control}
                name="tenantId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cooperative Branch</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger className="rounded-xl h-12">
                          <SelectValue placeholder="Select your branch" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {tenants.map((t) => (
                          <SelectItem
                            key={t.tenant_id}
                            value={t.tenant_id.toString()}
                          >
                            {t.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder="juan.agapay"
                        className="rounded-xl h-12"
                      />
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
                        <Input
                          {...field}
                          disabled={isPending}
                          placeholder="******"
                          type={showPassword ? "text" : "password"}
                          className="rounded-xl h-12 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
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
            </>
          )}
          <Button
            disabled={isPending}
            type="submit"
            className="w-full rounded-xl h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all mt-4"
          >
            {isPending
              ? "Connecting..."
              : showTwoFactor
                ? "Verify Code"
                : "Sign In"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BeatLoader } from "react-spinners";

import { newVerification } from "@/actions/new-verification";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ShieldCheck, ShieldAlert } from "lucide-react";

function NewVerificationForm() {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();

  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const onSubmit = useCallback(() => {
    if (success || error) return;

    if (!token) {
      setError("Missing token!");
      return;
    }

    newVerification(token)
      .then((data) => {
        setSuccess(data.success);
        setError(data.error);
        if (data.success) toast.success("Account verified successfully!");
        if (data.error) toast.error(data.error);
      })
      .catch(() => {
        setError("Something went wrong!");
      });
  }, [token, success, error]);

  useEffect(() => {
    onSubmit();
  }, [onSubmit]);

  return (
    <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-2xl">
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
          {success ? (
            <ShieldCheck className="w-10 h-10 text-emerald-600" />
          ) : error ? (
            <ShieldAlert className="w-10 h-10 text-red-600" />
          ) : (
            <BeatLoader color="#059669" />
          )}
        </div>
      </div>

      <h1 className="text-3xl font-bold text-slate-900 mb-2">
        {success
          ? "Agapay Secured!"
          : error
            ? "Verification Error"
            : "Securing your Agapay..."}
      </h1>

      <p className="text-slate-500 mb-8">
        {success
          ? "Your account has been verified. You can now access the shared treasury."
          : error
            ? error
            : "Wait a moment while we lock in your credentials."}
      </p>

      {(success || error) && (
        <Link href="/">
          <Button className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all">
            Bumalik sa Homepage
          </Button>
        </Link>
      )}
    </div>
  );
}

export default function NewVerificationPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <Suspense fallback={<BeatLoader color="#059669" />}>
        <NewVerificationForm />
      </Suspense>
    </div>
  );
}

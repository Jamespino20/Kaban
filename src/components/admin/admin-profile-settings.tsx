"use client";

import { useState, useTransition, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { User2, Mail, Phone, Camera, Loader2 } from "lucide-react";
import { updateProfileInfo } from "@/actions/admin-actions";
import { useFormPersistence } from "@/hooks/use-form-persistence";

export function AdminProfileSettings({
  initialData,
}: {
  initialData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    photoUrl?: string | null;
  };
}) {
  const [isPending, startTransition] = useTransition();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    initialData.photoUrl || null,
  );
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm({
    defaultValues: {
      firstName: initialData.firstName,
      lastName: initialData.lastName,
      email: initialData.email,
      phone: initialData.phone,
    },
  });

  const { draftFound, clearPersistence, dismissDraftNotice } = useFormPersistence(
    "admin-profile-settings",
    form.watch(),
    (restored) => {
      form.reset(restored);
    },
    true,
  );

  // Clear draft when form is successfully submitted
  // useEffect(() => {
  //   if (isSubmitSuccessful) {
  //     dismissDraftNotice();
  //   }
  // }, [isSubmitSuccessful, dismissDraftNotice]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAvatar(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
        toast.success("Avatar selected. Save changes to confirm.");
        setIsUploadingAvatar(false);
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error("Failed to read image file.");
      setIsUploadingAvatar(false);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = form.handleSubmit(
    async (values) => {
      startTransition(async () => {
        const res = await updateProfileInfo({
          ...values,
          photoUrl: avatarUrl || undefined,
        });
        if (res.success) {
          toast.success("Profile updated successfully.");
          clearPersistence();
          dismissDraftNotice();
        } else {
          toast.error(res.error || "Failed to update profile.");
        }
      });
    },
    (error) => {
      toast.error("Validation failed. Please check the form.");
    }
  );

  return (
    <div className="dashboard-card p-8 space-y-8">
      {draftFound && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-600 text-xs font-bold">!</div>
          <p className="flex-1 font-medium">We found a saved draft from your last session. Continue where you left off.</p>
          <button
            type="button"
            onClick={() => { clearPersistence(); dismissDraftNotice(); }}
            className="text-xs font-bold text-amber-600 hover:text-amber-800 underline"
          >
            Dismiss
          </button>
        </div>
      )}
      <div className="flex items-center gap-4">
        <div className="relative group">
          <div className="h-16 w-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center overflow-hidden">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <User2 className="h-7 w-7" />
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingAvatar}
            className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md hover:bg-emerald-600 transition-colors"
            title="Upload avatar"
          >
            {isUploadingAvatar ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Camera className="h-3.5 w-3.5" />
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarUpload}
          />
        </div>
        <div>
          <h3 className="text-xl font-display font-bold text-slate-900">
            Personal Information
          </h3>
          <p className="text-sm text-slate-500">
            Update your name, email, and contact details.
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        id="first-name"
                        className="h-11 rounded-xl"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="space-y-3">
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        id="last-name"
                        className="h-11 rounded-xl"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="space-y-3">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Mail className="h-4 w-4" /> Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id="email"
                      type="email"
                      className="h-11 rounded-xl"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-3">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Phone className="h-4 w-4" /> Phone
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id="phone"
                      placeholder="+63..."
                      className="h-11 rounded-xl"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="pt-4 flex justify-end">
            <Button
              type="submit"
              disabled={isPending}
              className="h-12 px-8 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/10 font-bold"
            >
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

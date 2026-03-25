"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  User,
  Mail,
  Lock,
  Phone,
  UserCircle,
  MapPin,
  IdCard,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Eye,
  EyeOff,
} from "lucide-react";

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
import { Card } from "@/components/ui/card";
import { register } from "@/actions/register";
import { uploadIdPicture } from "@/actions/upload";

const EnhancedRegisterSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    middleName: z.string().optional(),
    lastName: z.string().min(1, "Last name is required"),
    username: z.string().min(3, "Min 3 characters"),
    email: z
      .string()
      .email("Invalid Gmail account")
      .refine((e) => e.endsWith("@gmail.com"), "Must be a Gmail account"),
    phone: z.string().min(10, "Invalid phone number"),
    password: z.string().min(6, "Min 6 characters"),
    confirmPassword: z.string(),
    birthdate: z.string().min(1, "Birthdate is required"),
    gender: z.enum(["male", "female", "other"]),
    region: z.string().min(1, "Region is required"),
    province: z.string().min(1, "Province is required"),
    city: z.string().min(1, "City is required"),
    barangay: z.string().min(1, "Barangay is required"),
    termsAccepted: z.boolean().refine((v) => v === true, "Must accept terms"),
    privacyAccepted: z
      .boolean()
      .refine((v) => v === true, "Must accept privacy policy"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export function EnhancedRegisterForm() {
  const [step, setStep] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [idUrl, setIdUrl] = useState<string>("");

  const form = useForm<z.infer<typeof EnhancedRegisterSchema>>({
    resolver: zodResolver(EnhancedRegisterSchema),
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      username: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      birthdate: "",
      gender: "male",
      region: "",
      province: "",
      city: "",
      barangay: "",
      termsAccepted: false,
      privacyAccepted: false,
    },
  });

  const nextStep = async () => {
    const fields = getStepFields(step);
    const isValid = await form.trigger(fields as any);
    if (isValid) setStep((s) => s + 1);
  };

  const prevStep = () => setStep((s) => s - 1);

  const getStepFields = (step: number) => {
    switch (step) {
      case 1:
        return ["username", "email", "phone", "password", "confirmPassword"];
      case 2:
        return ["firstName", "middleName", "lastName", "birthdate", "gender"];
      case 3:
        return ["region", "province", "city", "barangay"];
      case 4:
        return ["termsAccepted", "privacyAccepted"];
      default:
        return [];
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIdFile(file);
      const formData = new FormData();
      formData.append("file", file);
      const res = await uploadIdPicture(formData);
      if (res.success) {
        setIdUrl(res.url!);
        toast.success("ID Picture uploaded");
      } else {
        toast.error(res.error || "Upload failed");
      }
    }
  };

  const onSubmit = (values: z.infer<typeof EnhancedRegisterSchema>) => {
    if (!idUrl) {
      toast.error("Please upload an ID picture");
      return;
    }

    startTransition(async () => {
      const res = await register({
        ...values,
        idPicture: idUrl,
        name: `${values.firstName} ${values.lastName}`, // Fallback for general name
      });
      if (res.error) toast.error(res.error);
      if (res.success) toast.success(res.success);
    });
  };

  return (
    <Card className="w-full max-w-2xl bg-white/80 backdrop-blur-xl border-slate-200/60 shadow-2xl rounded-[2rem] overflow-hidden">
      <div className="bg-emerald-600 p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-display font-bold italic">
            Buksan ang Kaban
          </h2>
          <p className="text-emerald-50 text-sm mt-1">
            Hakbang {step} ng 4: {getStepTitle(step)}
          </p>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl" />
      </div>

      <div className="p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input
                            {...field}
                            placeholder="juan_treasures"
                            className="pl-11 rounded-xl h-12"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gmail Account</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input
                            {...field}
                            type="email"
                            placeholder="example@gmail.com"
                            className="pl-11 rounded-xl h-12"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input
                            {...field}
                            placeholder="09123456789"
                            className="pl-11 rounded-xl h-12"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                              type={showPassword ? "text" : "password"}
                              className="pl-11 pr-10 rounded-xl h-12"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
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
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                              {...field}
                              type="password"
                              className="pl-11 rounded-xl h-12"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} className="rounded-xl h-12" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="middleName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Middle Name</FormLabel>
                        <FormControl>
                          <Input {...field} className="rounded-xl h-12" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} className="rounded-xl h-12" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="birthdate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Birthdate</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="date"
                            className="rounded-xl h-12"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="w-full rounded-xl h-12 border border-slate-200 px-4 bg-white outline-none"
                          >
                            <option value="male">Lalaki (Male)</option>
                            <option value="female">Babae (Female)</option>
                            <option value="other">Iba pa</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="region"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Region</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g. Region IV-A"
                            className="rounded-xl h-12"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="province"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Province</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g. Batangas"
                            className="rounded-xl h-12"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City / Municipality</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g. Lipa City"
                            className="rounded-xl h-12"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="barangay"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Barangay</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g. Marawoy"
                            className="rounded-xl h-12"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-4">
                  <FormLabel>Handa na ang iyong ID Picture</FormLabel>
                  <Card
                    className="border-dashed border-2 border-slate-200 p-8 flex flex-col items-center justify-center text-center space-y-4 cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() =>
                      document.getElementById("id-upload")?.click()
                    }
                  >
                    <input
                      id="id-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    {idUrl ? (
                      <div className="space-y-2">
                        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                        <p className="text-emerald-600 font-bold">
                          Na-upload na ang ID!
                        </p>
                      </div>
                    ) : (
                      <>
                        <IdCard className="w-12 h-12 text-slate-300" />
                        <p className="text-sm text-slate-500">
                          I-click upang mag-upload ng Valid ID (Passport, UMID,
                          Driver&apos;s License, etc.)
                        </p>
                      </>
                    )}
                  </Card>
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="termsAccepted"
                    render={({ field }) => (
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="w-5 h-5 rounded border-slate-300 text-emerald-600 outline-none"
                        />
                        <span className="text-sm text-slate-600">
                          Tinatanggap ko ang{" "}
                          <a
                            href="/terms"
                            className="text-emerald-600 underline"
                          >
                            Terms of Service
                          </a>
                        </span>
                      </div>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="privacyAccepted"
                    render={({ field }) => (
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="w-5 h-5 rounded border-slate-300 text-emerald-600 outline-none"
                        />
                        <span className="text-sm text-slate-600">
                          Sumasang-ayon ako sa{" "}
                          <a
                            href="/privacy"
                            className="text-emerald-600 underline"
                          >
                            Privacy Policy
                          </a>
                        </span>
                      </div>
                    )}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className="rounded-xl h-12 px-8 flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Mabalik
                </Button>
              )}
              {step < 4 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="ml-auto rounded-xl h-12 px-8 bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-2"
                >
                  Susunod
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  disabled={isPending}
                  type="submit"
                  className="ml-auto rounded-xl h-12 px-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg shadow-xl shadow-emerald-600/20"
                >
                  {isPending ? "Nagrerehistro..." : "Magsimula Na!"}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </Card>
  );
}

function getStepTitle(step: number) {
  switch (step) {
    case 1:
      return "Impormasyon ng Account";
    case 2:
      return "Personal na Detalye";
    case 3:
      return "Lokasyon";
    case 4:
      return "Beripikasyon";
    default:
      return "";
  }
}

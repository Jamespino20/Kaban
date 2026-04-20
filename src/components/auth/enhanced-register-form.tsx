"use client";

import { useState, useTransition, useEffect } from "react";
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
  Building2,
  FileText,
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
import { getRegions, getTenantsByRegion } from "@/actions/tenant-management";
import {
  fetchPsgcRegions,
  fetchPsgcProvinces,
  fetchPsgcCities,
  fetchPsgcBarangays,
} from "@/actions/psgc-actions";
import { LocationComboBox } from "@/components/ui/location-combo-box";

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
    businessName: z.string().optional(),
    maritalStatus: z.enum([
      "single",
      "married",
      "widowed",
      "separated",
      "annulled",
    ]),
    password: z.string().min(6, "Min 6 characters"),
    confirmPassword: z.string(),
    birthdate: z.string().min(1, "Birthdate is required"),
    gender: z.enum(["male", "female", "other"]),
    regionId: z.string().min(1, "Region is required"),
    tenantId: z.string().min(1, "Branch is required"),
    psgcRegion: z.string().min(1, "PSGC Region is required"),
    province: z.string().min(1, "Province is required"),
    city: z.string().min(1, "City is required"),
    barangay: z.string().min(1, "Barangay is required"),
    streetAddress: z.string().min(1, "Street address is required"),
    mothersMaidenName: z.string().min(1, "Mother's maiden name is required"),
    placeOfBirth: z.string().min(1, "Place of birth is required"),
    tin: z.string().optional(),
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
  const [brgyCertUrl, setBrgyCertUrl] = useState<string>("");
  const [businessPermitUrl, setBusinessPermitUrl] = useState<string>("");
  const [successData, setSuccessData] = useState<{
    msg: string;
    memberCode: string;
  } | null>(null);

  // New State for Multi-Tenancy
  const [regions, setRegions] = useState<
    { id: number; name: string; reg_code: string }[]
  >([]);
  const [tenants, setTenants] = useState<{ tenant_id: number; name: string }[]>(
    [],
  );

  // PSGC Geographical State
  const [psgcRegions, setPsgcRegions] = useState<
    { code: string; name: string }[]
  >([]);
  const [geoProvinces, setGeoProvinces] = useState<
    { code: string; name: string }[]
  >([]);
  const [geoCities, setGeoCities] = useState<{ code: string; name: string }[]>(
    [],
  );
  const [geoBarangays, setGeoBarangays] = useState<
    { code: string; name: string }[]
  >([]);

  const form = useForm<z.infer<typeof EnhancedRegisterSchema>>({
    resolver: zodResolver(EnhancedRegisterSchema),
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      username: "",
      email: "",
      phone: "",
      businessName: "",
      maritalStatus: "single",
      password: "",
      confirmPassword: "",
      birthdate: "",
      gender: "male",
      regionId: "",
      tenantId: "",
      psgcRegion: "",
      province: "",
      city: "",
      barangay: "",
      streetAddress: "",
      mothersMaidenName: "",
      placeOfBirth: "",
      tin: "",
      termsAccepted: false,
      privacyAccepted: false,
    },
  });

  // Fetch Regions + PSGC Regions on Mount
  useEffect(() => {
    const fetchData = async () => {
      const [regionData, psgcData] = await Promise.all([
        getRegions(),
        fetchPsgcRegions(),
      ]);
      if (regionData.length === 0) {
        console.warn("No Agapay Areas found in database.");
      }
      setRegions(regionData as any);
      setPsgcRegions(psgcData);
    };
    fetchData();
  }, []);

  // Handler: When Agapay Region (TenantGroup/Branch) Changes
  const onRegionChange = async (regionId: string) => {
    form.setValue("regionId", regionId);
    form.setValue("tenantId", "");

    if (regionId) {
      const tenantData = await getTenantsByRegion(parseInt(regionId));
      setTenants(tenantData);
    } else {
      setTenants([]);
    }
  };

  // Handler: When PSGC Region Changes (for address)
  const onPsgcRegionChange = async (regCode: string) => {
    form.setValue("psgcRegion", regCode);
    form.setValue("province", "");
    form.setValue("city", "");
    form.setValue("barangay", "");

    if (regCode) {
      const provinceData = await fetchPsgcProvinces(regCode);
      setGeoProvinces(provinceData);
    } else {
      setGeoProvinces([]);
    }
    setGeoCities([]);
    setGeoBarangays([]);
  };

  // Handler: When Province Changes
  const onProvinceChange = async (provCode: string) => {
    form.setValue("province", provCode);
    form.setValue("city", "");
    form.setValue("barangay", "");

    if (provCode) {
      const cityData = await fetchPsgcCities(provCode);
      setGeoCities(cityData.map((c) => ({ code: c.code, name: c.name })));
    } else {
      setGeoCities([]);
    }
    setGeoBarangays([]);
  };

  // Handler: When City Changes
  const onCityChange = async (munCode: string) => {
    form.setValue("city", munCode);
    form.setValue("barangay", "");

    if (munCode) {
      const barangayData = await fetchPsgcBarangays(munCode);
      setGeoBarangays(
        barangayData.map((b) => ({ code: b.code, name: b.name })),
      );
    } else {
      setGeoBarangays([]);
    }
  };

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
        return [
          "firstName",
          "middleName",
          "lastName",
          "birthdate",
          "gender",
          "maritalStatus",
          "mothersMaidenName",
          "placeOfBirth",
          "businessName",
        ];
      case 3:
        return [
          "regionId",
          "tenantId",
          "psgcRegion",
          "province",
          "city",
          "barangay",
        ];
      case 4:
        return ["termsAccepted", "privacyAccepted"];
      default:
        return [];
    }
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "id" | "brgy" | "business",
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      const res = await uploadIdPicture(formData);
      if (res.success) {
        if (type === "id") setIdUrl(res.url!);
        if (type === "brgy") setBrgyCertUrl(res.url!);
        if (type === "business") setBusinessPermitUrl(res.url!);
        toast.success(`${type.toUpperCase()} Picture uploaded`);
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

    const selectedRegion = regions.find(
      (r) => r.id === parseInt(values.regionId),
    );
    const selectedProv = geoProvinces.find((p) => p.code === values.province);
    const selectedCity = geoCities.find((c) => c.code === values.city);
    // Barangay in form is ID, we might need its name
    const selectedBarangay = geoBarangays.find(
      (b) => b.code === values.barangay,
    );

    startTransition(async () => {
      const res = await register({
        ...values,
        region: selectedRegion?.name || "Unknown",
        province: selectedProv?.name || values.province,
        city: selectedCity?.name || values.city,
        barangay: selectedBarangay?.name || values.barangay,
        streetAddress: values.streetAddress,
        tenantId: parseInt(values.tenantId),
        idPicture: idUrl,
        brgyCertUrl,
        businessPermitUrl,
        mothersMaidenName: values.mothersMaidenName,
        placeOfBirth: values.placeOfBirth,
        tin: values.tin,
      });
      if (res.error) toast.error(res.error);
      if (res.success) {
        toast.success(res.success);
        setSuccessData({
          msg: res.success,
          memberCode: res.memberCode || "ASN-TEMP",
        });
      }
    });
  };

  return (
    <div className="w-full">
      <div className="bg-emerald-600 p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-display font-bold italic">
            Simulan ang Agapay
          </h2>
          <p className="text-emerald-50 text-sm mt-1">
            Hakbang {step} ng 4: {getStepTitle(step)}
          </p>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl" />
      </div>

      <div className="p-8">
        {successData ? (
          <div className="space-y-8 animate-in zoom-in duration-500 text-center py-8">
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/10">
              <CheckCircle2 className="w-12 h-12 text-emerald-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-display font-bold text-slate-900 leading-tight">
                Mabuhay! Bienvenido sa Agapay.
              </h3>
              <p className="text-slate-500">
                Ang iyong account ay matagumpay na nagawa.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-8 space-y-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                Your Member Code
              </p>
              <p className="text-4xl font-display font-black text-emerald-600 tracking-tighter">
                {successData.memberCode}
              </p>
            </div>

            <div className="space-y-4 pt-4">
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-4 text-left">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <p className="text-sm text-blue-700 leading-snug">
                  <strong>I-check ang iyong email.</strong> Nagpadala kami ng
                  verification link sa iyong Gmail inbox upang ma-activate ang
                  iyong Agapay account.
                </p>
              </div>

              <Button
                onClick={() => window.location.reload()}
                className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg transition-all"
              >
                Tapusin ang Registration
              </Button>
            </div>
          </div>
        ) : (
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
                              className="w-full rounded-xl h-12 border border-slate-200 px-4 bg-white outline-none font-bold text-slate-700"
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="maritalStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Marital Status</FormLabel>
                          <FormControl>
                            <select
                              {...field}
                              className="w-full rounded-xl h-12 border border-slate-200 px-4 bg-white outline-none font-bold text-slate-700"
                            >
                              <option value="single">Single</option>
                              <option value="married">Married</option>
                              <option value="widowed">Widowed</option>
                              <option value="separated">Separated</option>
                              <option value="annulled">Annulled</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="mothersMaidenName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Pangalan ng Ina (Mother's Maiden Name)
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Pangalan bago ikinasal"
                              className="rounded-xl h-12"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="placeOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Lugar ng Kapanganakan (Place of Birth)
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Lungsod o Probinsya"
                              className="rounded-xl h-12"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>TIN (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="000-000-000-000"
                              className="rounded-xl h-12"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="businessName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Name (Optional)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                              <Input
                                {...field}
                                placeholder="Pangalan ng iyong Negosyo"
                                className="pl-11 rounded-xl h-12 font-bold"
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

              {step === 3 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                    Agapay Cooperative
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="regionId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Agapay Area</FormLabel>
                          <FormControl>
                            <select
                              {...field}
                              onChange={(e) => onRegionChange(e.target.value)}
                              className="w-full rounded-xl h-12 border border-slate-200 px-4 bg-white outline-none"
                            >
                              <option value="">Select Agapay Area</option>
                              {regions.map((r: any) => (
                                <option key={r.id} value={r.id.toString()}>
                                  {r.name}
                                </option>
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tenantId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Branch</FormLabel>
                          <FormControl>
                            <select
                              {...field}
                              disabled={!form.getValues("regionId")}
                              className="w-full rounded-xl h-12 border border-slate-200 px-4 bg-white outline-none font-bold text-emerald-700"
                            >
                              <option value="">Select Branch</option>
                              {tenants.map((t: any) => (
                                <option
                                  key={t.tenant_id}
                                  value={t.tenant_id.toString()}
                                >
                                  {t.name}
                                </option>
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                      Your Address (PSGC)
                    </h4>

                    <FormField
                      control={form.control}
                      name="streetAddress"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Street & House No.</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Ex: 123 Rizal St., Phase 1"
                              className="rounded-xl h-10 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="psgcRegion"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Region</FormLabel>
                          <FormControl>
                            <LocationComboBox
                              items={psgcRegions}
                              value={field.value}
                              onChange={(val) => {
                                field.onChange(val);
                                onPsgcRegionChange(val);
                              }}
                              placeholder="Select Region"
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
                        <FormItem className="flex flex-col">
                          <FormLabel>Province</FormLabel>
                          <FormControl>
                            <LocationComboBox
                              items={geoProvinces}
                              value={field.value}
                              onChange={(val) => {
                                field.onChange(val);
                                onProvinceChange(val);
                              }}
                              placeholder="Select Province"
                              disabled={
                                !form.getValues("psgcRegion") ||
                                geoProvinces.length === 0
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>City / Municipality</FormLabel>
                            <FormControl>
                              <LocationComboBox
                                items={geoCities}
                                value={field.value}
                                onChange={(val) => {
                                  field.onChange(val);
                                  onCityChange(val);
                                }}
                                placeholder="Select City"
                                disabled={
                                  !form.getValues("province") ||
                                  geoCities.length === 0
                                }
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
                          <FormItem className="flex flex-col">
                            <FormLabel>Barangay</FormLabel>
                            <FormControl>
                              <LocationComboBox
                                items={geoBarangays}
                                value={field.value}
                                onChange={(val) => {
                                  field.onChange(val);
                                }}
                                placeholder="Select Barangay"
                                disabled={
                                  !form.getValues("city") ||
                                  geoBarangays.length === 0
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <FormLabel>ID Picture</FormLabel>
                      <Card
                        className="border-dashed border-2 border-slate-200 p-6 flex flex-col items-center justify-center text-center space-y-4 cursor-pointer hover:bg-slate-50 transition-colors"
                        onClick={() =>
                          document.getElementById("id-upload")?.click()
                        }
                      >
                        <input
                          id="id-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, "id")}
                        />
                        {idUrl ? (
                          <div className="space-y-2">
                            <img
                              src={idUrl}
                              alt="ID Preview"
                              className="w-16 h-16 object-cover rounded-xl mx-auto shadow-md"
                            />
                            <p className="text-emerald-600 text-[10px] font-bold">
                              Palitan
                            </p>
                          </div>
                        ) : (
                          <>
                            <IdCard className="w-8 h-8 text-slate-300" />
                            <p className="text-[10px] text-slate-500">
                              I-click para sa ID
                            </p>
                          </>
                        )}
                      </Card>
                    </div>

                    <div className="space-y-4">
                      <FormLabel>Barangay Certificate</FormLabel>
                      <Card
                        className="border-dashed border-2 border-slate-200 p-6 flex flex-col items-center justify-center text-center space-y-4 cursor-pointer hover:bg-slate-50 transition-colors"
                        onClick={() =>
                          document.getElementById("brgy-upload")?.click()
                        }
                      >
                        <input
                          id="brgy-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, "brgy")}
                        />
                        {brgyCertUrl ? (
                          <div className="space-y-2">
                            <img
                              src={brgyCertUrl}
                              alt="Brgy Preview"
                              className="w-16 h-16 object-cover rounded-xl mx-auto shadow-md"
                            />
                            <p className="text-emerald-600 text-[10px] font-bold">
                              Palitan
                            </p>
                          </div>
                        ) : (
                          <>
                            <FileText className="w-8 h-8 text-slate-300" />
                            <p className="text-[10px] text-slate-500">
                              I-click para sa Brgy Cert
                            </p>
                          </>
                        )}
                      </Card>
                    </div>
                  </div>

                  {form.getValues("businessName") && (
                    <div className="space-y-4">
                      <FormLabel>Business Permit</FormLabel>
                      <Card
                        className="border-dashed border-2 border-slate-200 p-6 flex flex-col items-center justify-center text-center space-y-4 cursor-pointer hover:bg-slate-50 transition-colors"
                        onClick={() =>
                          document.getElementById("business-upload")?.click()
                        }
                      >
                        <input
                          id="business-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, "business")}
                        />
                        {businessPermitUrl ? (
                          <div className="space-y-2">
                            <img
                              src={businessPermitUrl}
                              alt="Business Preview"
                              className="w-16 h-16 object-cover rounded-xl mx-auto shadow-md"
                            />
                            <p className="text-emerald-600 text-[10px] font-bold">
                              Palitan
                            </p>
                          </div>
                        ) : (
                          <>
                            <Building2 className="w-8 h-8 text-slate-300" />
                            <p className="text-[10px] text-slate-500">
                              I-click para sa Business Permit
                            </p>
                          </>
                        )}
                      </Card>
                    </div>
                  )}

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
        )}
      </div>
    </div>
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

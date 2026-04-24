"use client";

import { useState, useEffect } from "react";
import { searchEligibleGuarantors } from "@/actions/member-search";
import { Users, Search, X, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { MICROFINANCE_POLICY } from "@/lib/microfinance-policy";

interface Guarantor {
  user_id: number;
  username: string;
  email: string;
  profile: {
    first_name: string;
    last_name: string;
  } | null;
}

interface GuaranteeRequestPanelProps {
  selectedGuarantors: number[];
  onChange: (guarantors: number[]) => void;
}

export const GuaranteeRequestPanel = ({
  selectedGuarantors,
  onChange,
}: GuaranteeRequestPanelProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Guarantor[]>([]);
  const [loading, setLoading] = useState(false);
  const [guarantorDetails, setGuarantorDetails] = useState<Guarantor[]>([]);

  useEffect(() => {
    const search = async () => {
      if (query.length < 3) {
        setResults([]);
        return;
      }
      setLoading(true);
      const res = await searchEligibleGuarantors(query);
      if (res.data) {
        setResults(
          res.data.filter((g: any) => !selectedGuarantors.includes(g.user_id)),
        );
      }
      setLoading(false);
    };

    const debounceSearch = setTimeout(search, 500);
    return () => clearTimeout(debounceSearch);
  }, [query, selectedGuarantors]);

  const addGuarantor = (guarantor: Guarantor) => {
    if (selectedGuarantors.length >= MICROFINANCE_POLICY.maxGuarantors) {
      return;
    }

    setGuarantorDetails((prev) => [...prev, guarantor]);
    onChange([...selectedGuarantors, guarantor.user_id]);
    setQuery("");
    setResults([]);
  };

  const removeGuarantor = (id: number) => {
    setGuarantorDetails((prev) => prev.filter((g: any) => g.user_id !== id));
    onChange(selectedGuarantors.filter((gid: number) => gid !== id));
  };

  const remainingNeeded = Math.max(
    0,
    MICROFINANCE_POLICY.minGuarantors - selectedGuarantors.length,
  );
  const remainingSlots = Math.max(
    0,
    MICROFINANCE_POLICY.maxGuarantors - selectedGuarantors.length,
  );

  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-3xl border border-emerald-100 bg-emerald-50/50 p-6">
        <div className="flex items-center gap-3 border-b border-emerald-100/50 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display font-bold leading-none text-emerald-900">
              Guarantor Support
            </h3>
            <p className="mt-1 text-xs text-emerald-700">
              Kumuha ng 1 hanggang 2 kapwa miyembro mula sa parehong branch.
            </p>
          </div>
        </div>

        {remainingNeeded > 0 ? (
          <div className="flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50 p-3 text-amber-600">
            <ShieldAlert className="h-5 w-5 shrink-0" />
            <p className="text-xs font-medium">
              Kailangan mo pa ng <strong>{remainingNeeded} guarantor</strong> bago
              magsumite. Maaari kang magdagdag ng hanggang {remainingSlots} pang
              guarantor para mas matibay ang social backing mo.
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-100/50 p-3 text-emerald-600">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <p className="text-xs font-medium">
              Kumpleto na ang minimum guarantor requirement mo. Maaari ka pang
              magdagdag ng isa kung gusto mo ng mas matibay na support signal.
            </p>
          </div>
        )}

        <div className="space-y-3 rounded-2xl border border-white/70 bg-white/80 p-4">
          <p className="text-xs leading-6 text-slate-600">
            Ang guarantors ay kapwa miyembro na sasalo ng <strong>20% to 30%</strong>{" "}
            ng obligasyon kapag nag-default ang loan. Kaya branch-active members
            lang ang pinapayagan sa pagpili.
          </p>
        </div>

        <div className="relative space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-400" />
            <Input
              placeholder="Hanapin ang pangalan o username ng miyembro..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-12 rounded-xl border-emerald-200 bg-white pl-9 focus:border-emerald-500 focus:ring-emerald-500/20"
            />
          </div>

          {loading && (
            <div className="absolute left-0 right-0 top-full z-10 mt-2 rounded-xl border border-emerald-100 bg-white p-4 text-center text-xs text-slate-500 shadow-xl">
              Naghahanap...
            </div>
          )}

          {results.length > 0 && query.length >= 3 && remainingSlots > 0 && (
            <div className="absolute left-0 right-0 top-full z-10 mt-2 overflow-hidden rounded-xl border border-emerald-100 bg-white shadow-xl">
              {results.map((g: any) => (
                <button
                  key={g.user_id}
                  type="button"
                  onClick={() => addGuarantor(g)}
                  className="flex w-full items-center justify-between border-b border-slate-50 px-4 py-3 text-left transition-colors hover:bg-emerald-50 last:border-0"
                >
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {g.profile?.first_name} {g.profile?.last_name}
                    </p>
                    <p className="text-xs text-slate-500">@{g.username}</p>
                  </div>
                  <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-600">
                    I-add
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {guarantorDetails.length > 0 && (
          <div className="space-y-3 pt-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Selected Guarantors
            </h4>
            <div className="space-y-2">
              {guarantorDetails.map((g: any) => (
                <div
                  key={g.user_id}
                  className="flex items-center justify-between rounded-xl border border-emerald-100 bg-white p-3 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold uppercase text-emerald-700">
                      {g.profile?.first_name?.[0] || g.username[0]}
                    </div>
                    <div>
                      <p className="text-sm font-bold leading-none text-slate-900">
                        {g.profile?.first_name} {g.profile?.last_name}
                      </p>
                      <p className="mt-0.5 text-[10px] text-slate-500">
                        @{g.username}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeGuarantor(g.user_id)}
                    className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

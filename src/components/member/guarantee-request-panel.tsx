"use client";

import { useState, useEffect } from "react";
import { searchEligibleGuarantors } from "@/actions/member-search";
import { Users, Search, X, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
        // Filter out already selected guarantors from results
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
    setGuarantorDetails((prev) => [...prev, guarantor]);
    onChange([...selectedGuarantors, guarantor.user_id]);
    setQuery("");
    setResults([]);
  };

  const removeGuarantor = (id: number) => {
    setGuarantorDetails((prev) => prev.filter((g) => g.user_id !== id));
    onChange(selectedGuarantors.filter((gid) => gid !== id));
  };

  const remainingNeeded = Math.max(0, 3 - selectedGuarantors.length);

  return (
    <div className="space-y-6">
      <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100 space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-emerald-100/50">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-emerald-900 leading-none">
              Paluwagan 2.0 Group Guarantee
            </h3>
            <p className="text-xs text-emerald-700 mt-1">
              Bumuo ng grupo upang maaprubahan ang iyong loan.
            </p>
          </div>
        </div>

        {remainingNeeded > 0 ? (
          <div className="flex items-start gap-3 text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-100">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <p className="text-xs font-medium">
              Kailangan mo pa ng <strong>{remainingNeeded} guarantors</strong>{" "}
              upang magpatuloy. Sila ay makakatanggap ng notification para
              sumang-ayon.
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-emerald-600 bg-emerald-100/50 p-3 rounded-xl border border-emerald-200">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <p className="text-xs font-medium">
              Kumpleto na ang iyong guarantors! Maaari ka nang magpatuloy.
            </p>
          </div>
        )}

        <div className="space-y-3 relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
            <Input
              placeholder="Hanapin ang pangalan o username ng miyembro..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 h-12 rounded-xl border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500/20 bg-white"
            />
          </div>

          {loading && (
            <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-white border border-emerald-100 rounded-xl shadow-xl z-10 text-center text-xs text-slate-500">
              Naghahanap...
            </div>
          )}

          {results.length > 0 && query.length >= 3 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-emerald-100 rounded-xl shadow-xl z-10 overflow-hidden">
              {results.map((g) => (
                <button
                  key={g.user_id}
                  type="button"
                  onClick={() => addGuarantor(g)}
                  className="w-full text-left px-4 py-3 hover:bg-emerald-50 transition-colors flex items-center justify-between border-b border-slate-50 last:border-0"
                >
                  <div>
                    <p className="font-bold text-sm text-slate-900">
                      {g.profile?.first_name} {g.profile?.last_name}
                    </p>
                    <p className="text-xs text-slate-500">@{g.username}</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                    I-add
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {guarantorDetails.length > 0 && (
          <div className="pt-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Selected Guarantors
            </h4>
            <div className="space-y-2">
              {guarantorDetails.map((g) => (
                <div
                  key={g.user_id}
                  className="flex items-center justify-between bg-white p-3 rounded-xl border border-emerald-100 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs uppercase">
                      {g.profile?.first_name?.[0] || g.username[0]}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-900 leading-none">
                        {g.profile?.first_name} {g.profile?.last_name}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        @{g.username}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeGuarantor(g.user_id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
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

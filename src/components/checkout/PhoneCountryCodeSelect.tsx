"use client";

import React, { useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";

interface PhoneCountryCodeSelectProps {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
}

const CODES: { country: string; iso: string; code: string }[] = [
  { country: "República Dominicana", iso: "DO", code: "+1" },
  { country: "Estados Unidos", iso: "US", code: "+1" },
  { country: "Puerto Rico", iso: "PR", code: "+1" },
  { country: "El Salvador", iso: "SV", code: "+503" },
  { country: "Guatemala", iso: "GT", code: "+502" },
  { country: "Honduras", iso: "HN", code: "+504" },
  { country: "Nicaragua", iso: "NI", code: "+505" },
  { country: "Costa Rica", iso: "CR", code: "+506" },
  { country: "Panamá", iso: "PA", code: "+507" },
  { country: "México", iso: "MX", code: "+52" },
  { country: "Colombia", iso: "CO", code: "+57" },
  { country: "Perú", iso: "PE", code: "+51" },
  { country: "Chile", iso: "CL", code: "+56" },
  { country: "Argentina", iso: "AR", code: "+54" },
  { country: "España", iso: "ES", code: "+34" },
];

export function getDialCodeForCountry(countryOrIso?: string): string {
  if (!countryOrIso) return "+1";
  const found = CODES.find(c => c.country === countryOrIso || c.iso === countryOrIso.toUpperCase());
  return found ? found.code : "+1";
}

export default function PhoneCountryCodeSelect({ value, onChange, error }: PhoneCountryCodeSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return CODES.filter(c => c.country.toLowerCase().includes(q) || c.code.includes(q) || c.iso.toLowerCase().includes(q));
  }, [query]);

  const current = useMemo(() => CODES.find(c => c.code === value), [value]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={`w-28 px-3 py-2.5 border rounded-lg text-left flex items-center justify-between focus:ring-2 focus:ring-opacity-50 ${
          error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
        }`}
      >
        <span className="truncate">{current ? `${current.country} (${current.code})` : value}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={query}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
                placeholder="Buscar país o código..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              />
            </div>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-center text-gray-500 text-sm">Sin resultados</div>
            ) : (
              filtered.map(item => (
                <button
                  key={`${item.iso}-${item.code}`}
                  onClick={() => { onChange(item.code); setOpen(false); }}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-blue-50 ${value === item.code ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}`}
                >
                  {item.country} <span className="text-gray-500">{item.code}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

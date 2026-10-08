"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Search, ChevronDown } from "lucide-react";
import { useToastStore } from "@/store/toastStore";

interface SmartDropdownProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  fetchOptions: () => Promise<string[]>;
  onCreateNew?: (name: string) => Promise<void>;
  placeholder?: string;
}

export function SmartDropdown({ label, value, onChange, fetchOptions, onCreateNew, placeholder }: SmartDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchOptions().then(setOptions);
    }
  }, [isOpen, fetchOptions]);

  // Click outside listener
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));
  const exactMatch = filtered.some(o => o.toLowerCase() === search.toLowerCase());

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setSearch("");
  };

  const handleCreate = async () => {
    if (onCreateNew && search && !exactMatch) {
      await onCreateNew(search);
      onChange(search);
      setIsOpen(false);
      useToastStore.getState().addToast(`Created "${search}" dynamically!`, "success");
      setSearch("");
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-body text-text-dark dark:text-text-soft-white mb-1">{label}</label>
      <div 
        className="w-full bg-light-pearl dark:bg-surface-cocoa border border-light-silver dark:border-surface-ash rounded-lg px-4 py-2.5 text-body text-text-dark dark:text-text-white cursor-pointer flex justify-between items-center transition-colors hover:border-primary"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={value ? "" : "text-text-muted"}>{value || placeholder || "Select..."}</span>
        <ChevronDown size={18} className="text-text-muted" />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white dark:bg-surface-graphite border border-light-silver dark:border-surface-ash rounded-xl shadow-xl overflow-hidden">
          <div className="p-2 border-b border-light-silver dark:border-surface-ash relative bg-light-pearl/50 dark:bg-surface-cocoa/50">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
            <input 
              type="text" 
              className="w-full bg-transparent pl-8 pr-4 py-1 text-sm outline-none text-text-dark dark:text-text-white" 
              placeholder={`Search ${label}...`}
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className="max-h-56 overflow-y-auto custom-scrollbar p-1">
            {filtered.map(opt => (
              <div 
                key={opt} 
                className="px-3 py-2 hover:bg-light-pearl dark:hover:bg-surface-cocoa rounded-lg cursor-pointer text-sm font-bold text-text-dark dark:text-text-white transition-colors"
                onClick={() => handleSelect(opt)}
              >
                {opt}
              </div>
            ))}
            
            {!exactMatch && search && (
              <div 
                className="px-3 py-3 hover:bg-primary/10 rounded-lg cursor-pointer text-sm text-primary font-bold flex items-center gap-2 transition-colors border-t border-transparent hover:border-primary/20 mt-1"
                onClick={handleCreate}
              >
                <Plus size={16} /> Add "{search}"
              </div>
            )}
            
            {filtered.length === 0 && !search && (
              <div className="px-3 py-6 text-center text-sm text-text-muted">Type to search or add new.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

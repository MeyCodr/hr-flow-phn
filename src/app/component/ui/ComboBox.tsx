"use client";

import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { useState, useRef, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";

interface ComboBoxProps {
  menu: { id: string | number; name: string }[];
  onSelect?: (item: { id: string | number; name: string } | null) => void;
  selectedValue?: string | null;
  disabled?: boolean;
  className?: string;
}

export default function ComboBox({
  menu,
  onSelect,
  selectedValue,
  disabled = false,
  className,
}: ComboBoxProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const comboRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  // Safe hydration fix
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        comboRef.current &&
        !comboRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredMenu =
    query === ""
      ? menu
      : menu.filter((item) =>
          item.name.toLowerCase().includes(query.toLowerCase())
        );

  const handleSelect = (value: string | null) => {
    if (disabled) return;
    setOpen(false);
    if (value === null) {
      onSelect?.(null);
      return;
    }
    const item = menu.find((i) => i.name === value) || null;
    onSelect?.(item);
  };

  const displayValue = (val: string) => {
    const item = menu.find((i) => i.id.toString() === val);
    return item ? item.name : val;
  };

  return (
    <div className="w-full relative" ref={comboRef}>
      {!mounted ? (
        <div className="w-full h-10 border border-gray-300 rounded-md bg-gray-50 animate-pulse"></div>
      ) : (
        <Combobox
          value={selectedValue || ""}
          onChange={handleSelect}
          disabled={disabled}
        >
          <div className="relative">
            <ComboboxInput
              placeholder="Select an option"
              displayValue={displayValue}
              onChange={(event) => setQuery(event.target.value)}
              onClick={() => !disabled && setOpen((prev) => !prev)}
              className={`w-full rounded-sm border px-3 py-2 pr-10 text-xs outline-none transition duration-150 ease-in-out ${className}
                ${
                  disabled
                    ? "bg-gray-200 cursor-not-allowed border-gray-300 text-black"
                    : "bg-white border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                }`}
            />
            <FaChevronDown
              className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer transition-transform duration-200
                ${open && !disabled ? "rotate-180" : "rotate-0"}
                ${
                  disabled
                    ? "cursor-not-allowed text-gray-400"
                    : "text-gray-400 hover:text-gray-600"
                }
              `}
              onClick={() => !disabled && setOpen((prev) => !prev)}
            />
          </div>

          {open && !disabled && (
            <ComboboxOptions
              static
              className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-300 bg-white py-1 focus:outline-none"
            >
              {filteredMenu.length === 0 ? (
                <div className="px-3 py-2 text-gray-500 text-xs">
                  No results found
                </div>
              ) : (
                filteredMenu.map((item) => (
                  <ComboboxOption
                    key={item.id}
                    value={item.name}
                    className="cursor-pointer select-none px-3 py-2 text-xs text-gray-700 data-[focus]:bg-indigo-100"
                  >
                    {item.name}
                  </ComboboxOption>
                ))
              )}
            </ComboboxOptions>
          )}
        </Combobox>
      )}
    </div>
  );
}

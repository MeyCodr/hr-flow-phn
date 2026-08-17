"use client";

import React, { useState, useRef, useEffect } from "react";

export type TimeValueType = string | null;

interface TimePickerProps {
  value: TimeValueType;
  onChange: (value: TimeValueType) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

function parseValue(value: TimeValueType): { hour: string; minute: string } {
  if (!value) return { hour: "00", minute: "00" };
  const [h, m] = value.split(":");
  return { hour: h ?? "00", minute: m ?? "00" };
}

export default function TimePicker({
  value,
  onChange,
  placeholder = "Select time",
  className = "",
  disabled = false,
}: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hour, setHour] = useState(parseValue(value).hour);
  const [minute, setMinute] = useState(parseValue(value).minute);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const parsed = parseValue(value);
    setHour(parsed.hour);
    setMinute(parsed.minute);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const emit = (h: string, m: string) => {
    onChange(`${h.padStart(2, "0")}:${m.padStart(2, "0")}`);
  };

  const handleHourChange = (h: string) => {
    if (disabled) return;
    const clamped = Math.min(23, Math.max(0, Number(h) || 0)).toString();
    setHour(clamped.padStart(2, "0"));
    emit(clamped, minute);
  };

  const handleMinuteChange = (m: string) => {
    if (disabled) return;
    const clamped = Math.min(59, Math.max(0, Number(m) || 0)).toString();
    setMinute(clamped.padStart(2, "0"));
    emit(hour, clamped);
  };

  const handleClear = () => {
    if (disabled) return;
    setHour("00");
    setMinute("00");
    onChange(null);
    setIsOpen(false);
  };

  const handleNow = () => {
    if (disabled) return;
    const now = new Date();
    const h = now.getHours().toString().padStart(2, "0");
    const m = now.getMinutes().toString().padStart(2, "0");
    setHour(h);
    setMinute(m);
    emit(h, m);
  };

  return (
    <div className="flex flex-col w-full" ref={ref}>
      <div className="relative w-full">
        <input
          type="text"
          readOnly
          value={value ?? ""}
          onFocus={() => !disabled && setIsOpen(true)}
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
          placeholder={placeholder}
          disabled={disabled}
          className={`${className} cursor-pointer ${
            disabled ? "bg-gray-200 dark:bg-gray-700 cursor-not-allowed" : "bg-white dark:bg-gray-800"
          }`}
        />
        <button
          type="button"
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
          disabled={disabled}
          className={`absolute right-3 top-1/2 -translate-y-1/2 text-lg transition-colors ${
            disabled
              ? "text-gray-400 cursor-not-allowed pointer-events-none"
              : "text-indigo-400 hover:text-indigo-600"
          }`}
        >
          🕒
        </button>

        {isOpen && !disabled && (
          <div className="absolute top-full left-0 mt-2 z-10 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-300 dark:border-gray-700 p-4 w-56 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-center gap-2">
              <div className="flex flex-col items-center flex-1">
                <button
                  type="button"
                  onClick={() => handleHourChange((Number(hour) + 1).toString())}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                >
                  <svg
                    className="w-4 h-4 text-gray-500 dark:text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 15l7-7 7 7"
                    />
                  </svg>
                </button>
                <input
                  type="number"
                  min={0}
                  max={23}
                  value={hour}
                  onChange={(e) => handleHourChange(e.target.value)}
                  className="w-14 text-center text-sm font-semibold border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100 rounded-lg py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => handleHourChange((Number(hour) - 1).toString())}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                >
                  <svg
                    className="w-4 h-4 text-gray-500 dark:text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">HH</span>
              </div>

              <span className="text-lg font-bold text-gray-400 dark:text-gray-500 mb-4">:</span>

              <div className="flex flex-col items-center flex-1">
                <button
                  type="button"
                  onClick={() => handleMinuteChange((Number(minute) + 1).toString())}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                >
                  <svg
                    className="w-4 h-4 text-gray-500 dark:text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 15l7-7 7 7"
                    />
                  </svg>
                </button>
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={minute}
                  onChange={(e) => handleMinuteChange(e.target.value)}
                  className="w-14 text-center text-sm font-semibold border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100 rounded-lg py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => handleMinuteChange((Number(minute) - 1).toString())}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                >
                  <svg
                    className="w-4 h-4 text-gray-500 dark:text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">MM</span>
              </div>
            </div>

            <div className="flex justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-2 text-xs text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                Clear
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleNow}
                  className="px-3 py-2 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 rounded-lg transition-colors"
                >
                  Now
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-2 text-xs text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

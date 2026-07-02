"use client";

import React, { useState, useRef, useEffect } from "react";

export type DateTimeValueType = string | null;

interface DateTimePickerProps {
  value: DateTimeValueType;
  onChange: (value: DateTimeValueType) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

function parseValue(value: DateTimeValueType): { date: Date | null; hour: string; minute: string } {
  if (!value) return { date: null, hour: "00", minute: "00" };
  const [datePart, timePart] = value.split("T");
  const date = datePart ? new Date(`${datePart}T00:00:00`) : null;
  const [h, m] = (timePart ?? "00:00").split(":");
  return { date: isNaN(date?.getTime() ?? NaN) ? null : date, hour: h ?? "00", minute: m ?? "00" };
}

export default function DateTimePicker({
  value,
  onChange,
  placeholder = "Select date & time",
  className = "",
  disabled = false,
}: DateTimePickerProps) {
  const parsed = parseValue(value);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(parsed.date);
  const [hour, setHour] = useState(parsed.hour);
  const [minute, setMinute] = useState(parsed.minute);
  const [currentMonth, setCurrentMonth] = useState(parsed.date ?? new Date());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const emit = (date: Date | null, h: string, m: string) => {
    if (!date) { onChange(null); return; }
    const datePart = date.toLocaleDateString("en-CA");
    onChange(`${datePart}T${h.padStart(2, "0")}:${m.padStart(2, "0")}`);
  };

  const handleDateSelect = (date: Date) => {
    if (disabled) return;
    setSelectedDate(date);
    emit(date, hour, minute);
  };

  const handleHourChange = (h: string) => {
    const clamped = Math.min(23, Math.max(0, Number(h) || 0)).toString();
    setHour(clamped.padStart(2, "0"));
    emit(selectedDate, clamped, minute);
  };

  const handleMinuteChange = (m: string) => {
    const clamped = Math.min(59, Math.max(0, Number(m) || 0)).toString();
    setMinute(clamped.padStart(2, "0"));
    emit(selectedDate, hour, clamped);
  };

  const handleClear = () => {
    setSelectedDate(null);
    setHour("00");
    setMinute("00");
    onChange(null);
    setIsOpen(false);
  };

  const handleNow = () => {
    const now = new Date();
    const h = now.getHours().toString().padStart(2, "0");
    const m = now.getMinutes().toString().padStart(2, "0");
    setSelectedDate(now);
    setHour(h);
    setMinute(m);
    setCurrentMonth(now);
    emit(now, h, m);
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const d = new Date(prev);
      d.setMonth(prev.getMonth() + (direction === "prev" ? -1 : 1));
      return d;
    });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();
    const days: Date[] = [];

    for (let i = firstDay - 1; i >= 0; i--)
      days.push(new Date(year, month - 1, prevMonthDays - i));
    for (let i = 1; i <= daysInMonth; i++)
      days.push(new Date(year, month, i));
    const nextMonth = new Date(year, month + 1, 1);
    for (let i = 1; days.length < 42; i++)
      days.push(new Date(nextMonth.getFullYear(), nextMonth.getMonth(), i));

    return days;
  };

  const isToday = (d: Date) => {
    const t = new Date();
    return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear();
  };

  const isSelected = (d: Date) =>
    !!selectedDate &&
    d.getDate() === selectedDate.getDate() &&
    d.getMonth() === selectedDate.getMonth() &&
    d.getFullYear() === selectedDate.getFullYear();

  const isCurrentMonth = (d: Date) => d.getMonth() === currentMonth.getMonth();

  const displayValue = value
    ? (() => {
        const [datePart, timePart] = value.split("T");
        if (!datePart) return "";
        const d = new Date(`${datePart}T00:00:00`);
        const dateStr = d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
        return timePart ? `${dateStr}, ${timePart}` : dateStr;
      })()
    : "";

  const calendarDays = getDaysInMonth(currentMonth);
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="flex flex-col w-full" ref={ref}>
      <div className="relative w-full">
        <input
          type="text"
          readOnly
          value={displayValue}
          onFocus={() => !disabled && setIsOpen(true)}
          onClick={() => !disabled && setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className={`${className} cursor-pointer ${disabled ? "bg-gray-200 cursor-not-allowed" : "bg-white"}`}
        />
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`absolute right-3 top-1/2 -translate-y-1/2 text-lg transition-colors ${
            disabled ? "text-gray-400 cursor-not-allowed pointer-events-none" : "text-indigo-400 hover:text-indigo-600"
          }`}
        >
          📅
        </button>

        {isOpen && !disabled && (
          <div className="absolute top-full left-0 mt-2 z-10 bg-white rounded-2xl shadow-2xl border border-gray-300 p-6 w-80 animate-in fade-in-50 zoom-in-95">
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-4">
              <button type="button" onClick={() => navigateMonth("prev")} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h3 className="text-sm font-semibold text-gray-800">
                {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </h3>
              <button type="button" onClick={() => navigateMonth("next")} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Days of week */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {daysOfWeek.map((day) => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">{day}</div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((date, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => handleDateSelect(date)}
                  className={`h-10 rounded-lg text-xs font-medium transition-all ${
                    isSelected(date)
                      ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-200"
                      : isToday(date)
                        ? "bg-indigo-50 text-indigo-600 border border-indigo-200"
                        : isCurrentMonth(date)
                          ? "text-gray-800 hover:bg-gray-100"
                          : "text-gray-400 hover:bg-gray-50"
                  }`}
                >
                  {date.getDate()}
                </button>
              ))}
            </div>

            {/* Time picker */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs font-medium text-gray-500 mb-2">Time</p>
              <div className="flex items-center gap-2">
                <div className="flex flex-col items-center flex-1">
                  <button type="button" onClick={() => handleHourChange((Number(hour) + 1).toString())} className="p-1 hover:bg-gray-100 rounded transition-colors">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <input
                    type="number"
                    min={0}
                    max={23}
                    value={hour}
                    onChange={(e) => handleHourChange(e.target.value)}
                    className="w-12 text-center text-sm font-semibold border border-gray-200 rounded-lg py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button type="button" onClick={() => handleHourChange((Number(hour) - 1).toString())} className="p-1 hover:bg-gray-100 rounded transition-colors">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                <span className="text-lg font-bold text-gray-400 mb-0.5">:</span>

                <div className="flex flex-col items-center flex-1">
                  <button type="button" onClick={() => handleMinuteChange((Number(minute) + 1).toString())} className="p-1 hover:bg-gray-100 rounded transition-colors">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <input
                    type="number"
                    min={0}
                    max={59}
                    value={minute}
                    onChange={(e) => handleMinuteChange(e.target.value)}
                    className="w-12 text-center text-sm font-semibold border border-gray-200 rounded-lg py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button type="button" onClick={() => handleMinuteChange((Number(minute) - 1).toString())} className="p-1 hover:bg-gray-100 rounded transition-colors">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                <div className="flex flex-col gap-1 ml-2">
                  <span className="text-xs text-gray-400">HH</span>
                  <span className="text-xs text-gray-400 mt-4">MM</span>
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="flex justify-between mt-4 pt-4 border-t border-gray-100">
              <button type="button" onClick={handleClear} className="px-3 py-2 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                Clear
              </button>
              <div className="flex gap-2">
                <button type="button" onClick={handleNow} className="px-3 py-2 text-xs text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors">
                  Now
                </button>
                <button type="button" onClick={() => setIsOpen(false)} className="px-3 py-2 text-xs text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors">
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

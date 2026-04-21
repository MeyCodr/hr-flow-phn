"use client";

import React, { useEffect, useRef } from "react";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export default function ProgressBar({
  currentStep,
  totalSteps,
}: ProgressBarProps) {
  const percent = (currentStep / totalSteps) * 100;
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (barRef.current) {
      barRef.current.style.width = `${percent}%`;
    }
  }, [percent]);

  return (
    <div className="w-full">
      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner">
        <div
          ref={barRef}
          className="h-full w-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500 shadow-lg"
        />
      </div>

      <p className="text-xs text-indigo-700 font-semibold mt-1 text-right tracking-wider">
        {percent.toFixed(0)}% Complete
      </p>
    </div>
  );
}

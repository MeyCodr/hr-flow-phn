"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IoClose, IoSparklesOutline } from "react-icons/io5";
import { APP_VERSION, RELEASE_HIGHLIGHTS } from "../../../../lib/version";

const STORAGE_KEY = "phnfms-last-seen-version";

export default function WhatsNewModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let lastSeen: string | null = null;
    try {
      lastSeen = localStorage.getItem(STORAGE_KEY);
    } catch {
      // localStorage unavailable (e.g. privacy mode) — just skip the popup
      return;
    }

    if (lastSeen !== APP_VERSION) {
      setOpen(true);
    }
  }, []);

  const dismiss = () => {
    setOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, APP_VERSION);
    } catch {
      // ignore
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={dismiss}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-white shadow-2xl dark:bg-gray-900"
          >
            <div className="relative bg-gradient-to-br from-indigo-950 via-indigo-900 to-[#1e1350] px-6 py-6 text-white">
              <button
                type="button"
                onClick={dismiss}
                aria-label="Close"
                className="absolute top-3 right-3 rounded-lg p-1 text-indigo-200 transition-colors hover:bg-white/10 hover:text-white"
              >
                <IoClose className="h-5 w-5" />
              </button>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-md shadow-amber-500/20">
                <IoSparklesOutline className="h-5 w-5 text-indigo-950" />
              </div>

              <h2 className="mt-4 text-lg font-bold">What&apos;s new</h2>
              <p className="mt-1 text-xs text-indigo-200">
                PHN FMS &middot; v{APP_VERSION}
              </p>
            </div>

            <div className="px-6 py-5">
              <ul className="flex flex-col gap-3">
                {RELEASE_HIGHLIGHTS.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                    {item}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={dismiss}
                className="mt-6 w-full cursor-pointer rounded-lg bg-indigo-900 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-800"
              >
                Got it
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

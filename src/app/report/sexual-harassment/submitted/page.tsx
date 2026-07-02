"use client";

import React from "react";
import { FiShield, FiCheckCircle, FiLock, FiHeart } from "react-icons/fi";

export default function SexualHarassmentReportSubmittedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl">

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <FiCheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </div>
        </div>

        {/* Main card */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 px-8 py-10 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Your Report Has Been Received
          </h1>
          <p className="text-sm text-indigo-700 font-medium mb-6">
            Thank you for trusting us with this.
          </p>

          <p className="text-sm text-gray-600 leading-relaxed mb-8">
            We want you to know that what you have done takes courage. Coming forward is never easy, and you should never have to face this alone. Your report is important and will be treated with the highest level of care and confidentiality.
          </p>

          <hr className="border-gray-100 mb-8" />

          {/* What happens next */}
          <div className="text-left mb-8">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">What happens next</h2>
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center mt-0.5">
                  <span className="text-xs font-bold text-indigo-700">1</span>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-800">Report received</p>
                  <p className="text-xs text-gray-500 mt-0.5">Our compliance team has been notified and will review your report.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center mt-0.5">
                  <span className="text-xs font-bold text-indigo-700">2</span>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-800">Investigation begins</p>
                  <p className="text-xs text-gray-500 mt-0.5">Your report will be carefully reviewed and investigated in a fair and professional manner.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center mt-0.5">
                  <span className="text-xs font-bold text-indigo-700">3</span>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-800">You will be kept informed</p>
                  <p className="text-xs text-gray-500 mt-0.5">If you provided your email, we will send you updates on the status of your case.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Reassurance badges */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="flex flex-col items-center gap-1.5 bg-indigo-50 rounded-xl p-3">
              <FiLock className="w-5 h-5 text-indigo-600" />
              <span className="text-xs text-indigo-700 font-medium text-center">Strictly Confidential</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 bg-green-50 rounded-xl p-3">
              <FiShield className="w-5 h-5 text-green-600" />
              <span className="text-xs text-green-700 font-medium text-center">You Are Protected</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 bg-rose-50 rounded-xl p-3">
              <FiHeart className="w-5 h-5 text-rose-500" />
              <span className="text-xs text-rose-600 font-medium text-center">You Are Not Alone</span>
            </div>
          </div>

          <p className="text-xs text-gray-400 leading-relaxed">
            If you need immediate support or have further concerns, please reach out to the HR department or a trusted person within your organisation. You are not alone in this.
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          PHN Compliance Team &mdash; handling your report with care and confidentiality.
        </p>

      </div>
    </div>
  );
}

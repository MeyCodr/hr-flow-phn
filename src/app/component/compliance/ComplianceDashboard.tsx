"use client";

import React, { useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import {
  SexualHarassmentAttachment,
  SexualHarassmentReport,
} from "@/generated/client";
import { withBasePath } from "@/lib/base-path";
import PrimaryButton from "@/app/component/ui/PrimaryButton";

type ReportWithAttachments = SexualHarassmentReport & {
  attachments: SexualHarassmentAttachment[];
};

const STATUS_OPTIONS = ["SUBMITTED", "UNDER_REVIEW", "RESOLVED", "CLOSED"];

export default function ComplianceDashboard({
  reports,
}: {
  reports: ReportWithAttachments[];
}) {
  const [selectedId, setSelectedId] = useState<number | null>(
    reports[0]?.id ?? null,
  );
  const [status, setStatus] = useState<string>(reports[0]?.status ?? "SUBMITTED");
  const [caseNotes, setCaseNotes] = useState<string>(reports[0]?.caseNotes ?? "");
  const [saving, setSaving] = useState(false);

  const selected = reports.find((r) => r.id === selectedId) ?? null;

  const selectReport = (report: ReportWithAttachments) => {
    setSelectedId(report.id);
    setStatus(report.status);
    setCaseNotes(report.caseNotes ?? "");
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await axios.patch(
        withBasePath(`/api/compliance/sexual-harassment/${selected.id}`),
        { status, caseNotes },
      );
      toast.success("Case updated");
      selected.status = status as SexualHarassmentReport["status"];
      selected.caseNotes = caseNotes;
    } catch (error) {
      let errorMessage = "Failed to update case";
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.error || errorMessage;
      }
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const downloadAttachment = (attachmentId: number) => {
    window.open(
      withBasePath(`/api/compliance/sexual-harassment/attachment/${attachmentId}`),
      "_blank",
    );
  };

  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="text-xs">
        <Toaster position="top-right" />
      </div>

      <div className="md:col-span-1 bg-white rounded-xl border border-gray-300 divide-y divide-gray-200 max-h-[70vh] overflow-y-auto">
        {reports.length === 0 && (
          <p className="p-4 text-xs text-gray-500">No reports submitted yet.</p>
        )}
        {reports.map((report) => (
          <button
            key={report.id}
            onClick={() => selectReport(report)}
            className={`w-full text-left p-4 hover:bg-indigo-50 transition ${
              selectedId === report.id ? "bg-indigo-100" : ""
            }`}
          >
            <p className="text-sm font-semibold">{report.reporterName}</p>
            <p className="text-xs text-gray-500">
              {new Date(report.createdAt).toLocaleString()}
            </p>
            <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded bg-gray-200 text-gray-700">
              {report.status}
            </span>
          </button>
        ))}
      </div>

      <div className="md:col-span-2 bg-white rounded-xl border border-gray-300 p-6">
        {!selected ? (
          <p className="text-xs text-gray-500">Select a report to view details.</p>
        ) : (
          <div className="text-xs space-y-4">
            <div>
              <h2 className="text-sm font-semibold">Reporter</h2>
              <p>{selected.reporterName} ({selected.reporterContact})</p>
              {selected.staffId && <p>Staff ID: {selected.staffId}</p>}
              {selected.workLocation && <p>Work Location: {selected.workLocation}</p>}
              {selected.divisionName && (
                <p>
                  {selected.divisionName} / {selected.departmentName ?? "-"} /{" "}
                  {selected.sectionName ?? "-"}
                </p>
              )}
              {selected.reportAs && <p>Reporting as: {selected.reportAs}</p>}
            </div>

            {(selected.perpetratorName ||
              selected.victimName ||
              selected.incidentLocation ||
              selected.incidentDateTime ||
              selected.witnessName) && (
              <div>
                <h2 className="text-sm font-semibold">Incident</h2>
                {selected.perpetratorName && <p>Perpetrator: {selected.perpetratorName}</p>}
                {selected.victimName && <p>Victim: {selected.victimName}</p>}
                {selected.incidentLocation && <p>Location: {selected.incidentLocation}</p>}
                {selected.incidentDateTime && <p>Date/Time: {selected.incidentDateTime}</p>}
                {selected.witnessName && <p>Witness: {selected.witnessName}</p>}
              </div>
            )}

            <div>
              <h2 className="text-sm font-semibold">Incident details</h2>
              <p className="whitespace-pre-wrap">{selected.description}</p>
            </div>

            {selected.evidenceType && (
              <div>
                <h2 className="text-sm font-semibold">Evidence</h2>
                <p>{selected.evidenceType}</p>
              </div>
            )}

            {selected.attachments.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold">Attachments</h2>
                {selected.attachments.map((att) => (
                  <p
                    key={att.id}
                    onClick={() => downloadAttachment(att.id)}
                    className="cursor-pointer rounded-lg bg-gray-50 p-2 border border-gray-300 hover:bg-indigo-50 hover:text-indigo-800 transition mt-1"
                  >
                    📎 {att.fileName}
                  </p>
                ))}
              </div>
            )}

            <div className="border-t border-gray-200 pt-4">
              <h2 className="text-sm font-semibold mb-2">Case management</h2>
              <div className="flex flex-col space-y-2 mb-3">
                <label htmlFor="status" className="font-medium">Status</label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 w-full bg-white"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col space-y-2 mb-3">
                <label htmlFor="caseNotes" className="font-medium">Case notes</label>
                <textarea
                  id="caseNotes"
                  value={caseNotes}
                  onChange={(e) => setCaseNotes(e.target.value)}
                  rows={4}
                  className="border border-gray-300 rounded-md px-3 py-2 w-full"
                />
              </div>

              <PrimaryButton
                name={saving ? "Saving..." : "Save"}
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 rounded text-white bg-indigo-800 hover:bg-indigo-900 cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

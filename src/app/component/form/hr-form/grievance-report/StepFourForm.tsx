import CheckBox from "@/app/component/ui/CheckBox";
import Label from "@/app/component/ui/Label";
import { GrievanceReportTypes, SelfFormData } from "@/app/types/types";
import { useState } from "react";

interface StepFour {
  data: GrievanceReportTypes;
  handleTextAreaChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleCheckboxBoolean: (
    name: keyof GrievanceReportTypes,
    value: boolean
  ) => void;
  handleFileChange: (file: File | null) => void;
  readOnly?: boolean;
  selfForm?: SelfFormData;
}

/* ✅ You can replace with real input fields */
function StepFourForm({
  data,
  handleCheckboxBoolean,
  handleFileChange,
  readOnly,
  selfForm,
}: StepFour) {
  const [file, setFile] = useState<File | null>(null);

  const parsedData = selfForm?.formData as unknown as GrievanceReportTypes;
  const formData = readOnly && parsedData ? parsedData : data;
  const fileData = selfForm?.attachments;

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <h2 className="font-semibold text-sm mb-4">
          F. Supporting Evidence (If any) / Bukti Sokongan (Jika Ada)
        </h2>
        <h2 className="font-semibold text-sm mb-4">
          G. Declaration (Pengisytiharan)
        </h2>
      </div>

      <div className="w-full border-b mb-4 border-indigo-800/20"></div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="text-xs">
          <div className="flex-1 flex flex-col space-y-2">
            <Label
              name={`Please upload any evidence file if you have any.`}
              htmlFor="attemptsResolve"
              className=""
            />

            <label
              htmlFor="fileAttachment"
              className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-xs transition
                  ${
                    readOnly
                      ? "bg-gray-200 border-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-white border-gray-300 text-gray-600 hover:border-indigo-800 hover:bg-indigo-100 hover:text-indigo-800 cursor-pointer"
                  }`}
            >
              <span className="truncate">
                {file ? file.name : "Choose a file or drag & drop"}
              </span>
              <span
                className={`ml-2 rounded px-3 py-1 text-xs font-medium text-white ${
                  readOnly ? "bg-gray-400" : "bg-indigo-800"
                }`}
              >
                Browse
              </span>
              <input
                id="fileAttachment"
                type="file"
                name="fileAttachment"
                className="hidden"
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0] || null;
                  setFile(selectedFile);
                  handleFileChange(selectedFile); // pass to parent
                }}
                disabled={readOnly}
              />
            </label>

            {file && (
              <div className="mt-1 w-full rounded-lg bg-gray-50 p-3 text-xs text-gray-700 border border-gray-300">
                📎 <strong>Selected:</strong> {file.name}
              </div>
            )}

            {readOnly &&
              fileData && parsedData &&
              fileData.map((item, i) => (
                <a
                  key={i}
                  href={`/uploads/${encodeURIComponent(item.fileName)}`} // 👈 direct link to public folder
                  download={item.fileName} // 👈 triggers browser download
                  className="mt-1 block w-full rounded-lg bg-gray-50 p-3 text-xs text-gray-700 border border-gray-300 hover:bg-indigo-50 hover:text-indigo-800 transition"
                >
                  📎 <strong>Download:</strong> {item.fileName}
                </a>
              ))}
          </div>
        </div>
        <div className="text-xs">
          <div className="flex-1 flex flex-col space-y-2">
            <Label
              name={`I declare that the information provided is true and understand that false claims may lead to disciplinary action. (Saya mengisytiharkan bahawa maklumat yang diberikan adalah benar dan memahami jika palsu, tindakan tatatertib boleh dikenakan).`}
              htmlFor="declaration"
              className=""
            />
            <div
              className="cursor-pointer"
              onClick={() =>
                handleCheckboxBoolean("declaration", !data.declaration)
              }
            >
              <div className="flex items-center gap-4">
                <CheckBox
                  //   checked={data.declaration}
                  checked={formData.declaration ?? ""}
                  onChange={(checked) =>
                    handleCheckboxBoolean("declaration", checked)
                  }
                />

                <Label
                  name="Yes, I declare all of the information is true"
                  htmlFor="declaration"
                  className="cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export { StepFourForm };

import CheckBox from "@/app/component/ui/CheckBox";
import Label from "@/app/component/ui/Label";
import { GrievanceReportTypes } from "@/app/types/types";
import { useState } from "react";

interface StepFour {
  data: GrievanceReportTypes;
  handleTextAreaChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleCheckboxBoolean: (
    name: keyof GrievanceReportTypes,
    value: boolean
  ) => void;
  handleFileChange: (file: File | null) => void;
}

/* ✅ You can replace with real input fields */
function StepFourForm({
  data,
  handleCheckboxBoolean,
  handleFileChange,
}: StepFour) {
  const [file, setFile] = useState<File | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <h2 className="font-semibold text-sm mb-4">
          Supporting Evidence (If any) / Bukti Sokongan (Jika Ada)
        </h2>
        <h2 className="font-semibold text-sm mb-4">
          Declaration (Pengisytiharan)
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
              className="flex max-w-sm cursor-pointer items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3 text-xs text-gray-600  transition hover:border-indigo-800 hover:bg-indigo-100 hover:text-indigo-800 mt-2"
            >
              <span className="truncate">
                {file ? file.name : "Choose a file or drag & drop"}
              </span>
              <span className="ml-2 rounded bg-indigo-800 px-3 py-1 text-xs font-medium text-white">
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
              />
            </label>

            {file && (
              <div className="mt-1 w-full rounded-lg bg-gray-50 p-3 text-xs text-gray-700 border border-gray-300">
                📎 <strong>Selected:</strong> {file.name}
              </div>
            )}
          </div>
        </div>
        <div className="text-xs">
          <div className="flex-1 flex flex-col space-y-2">
            <Label
              name={`I declare that the information provided is true and understand that false claims may lead to disciplinary action. (Saya mengisytiharkan bahawa maklumat yang diberikan adalah benar dan memahami jika palsu, tindakan tatatertib boleh dikenakan).`}
              htmlFor="declaration"
              className=""
            />
            <div className="flex items-center gap-4">
              <CheckBox
                checked={data.declaration}
                onChange={(checked) =>
                  handleCheckboxBoolean("declaration", checked)
                }
              />

              <Label
                name="Yes, I declare all of the information is true"
                htmlFor="declaration"
                className=""
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export { StepFourForm };

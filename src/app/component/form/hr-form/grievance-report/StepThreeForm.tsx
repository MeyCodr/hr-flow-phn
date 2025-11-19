import Label from "@/app/component/ui/Label";
import { GrievanceReportTypes } from "@/app/types/types";
import { TextArea } from "@/app/component/ui/TextArea";

interface StepThreeProps {
  data: GrievanceReportTypes;
  handleTextAreaChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  readOnly?: boolean;
  parsedData?: GrievanceReportTypes;
}

function StepThreeForm({
  data,
  handleTextAreaChange,
  readOnly,
  parsedData,
}: StepThreeProps) {
  const formData = readOnly && parsedData ? parsedData : data;
  console.log("form data: ", formData);

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <h2 className="font-semibold text-sm mb-4">
          D. Attempts to Resolve The Issue (Cubaan Awal Untuk Menyelesaikan Isu)
        </h2>
        <h2 className="font-semibold text-sm mb-4">
          E. Preferred Outcome (Penyelesaian Yang Diharapkan)
        </h2>
      </div>

      <div className="w-full border-b mb-4 border-indigo-800/20"></div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="text-xs">
          <div className="flex-1 flex flex-col space-y-2">
            <Label
              name={`Please outline any steps you have taken on the issue. (Sila nyatakan sebarang langkah yang telah anda ambil sebelum ini.)`}
              htmlFor="attemptsResolve"
              className=""
            />
            <TextArea
              id="attemptsResolve"
              name="attemptsResolve"
              value={formData.attemptsResolve ?? ""}
              onChange={handleTextAreaChange}
              disabled={readOnly}
              rows={6}
              placeholder="Attempts to Resolve"
              className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-900 placeholder:text-gray-400 placeholder:text-xs text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div className="text-xs">
          <div className="flex-1 flex flex-col space-y-2">
            <Label
              name={`What action do you wish to be taken to resolve this complaint/grievance? (Apakah tindakan penyelesaian yang dihrapkan bagi aduan/rungutan ini?)`}
              htmlFor="preferredOutcome"
              className=""
            />
            <TextArea
              id="preferredOutcome"
              name="preferredOutcome"
              value={formData.preferredOutcome ?? ""}
              onChange={handleTextAreaChange}
              disabled={readOnly}
              rows={6}
              placeholder="Preferred Outcome"
              className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-900 placeholder:text-gray-400 placeholder:text-xs text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>
    </>
  );
}

export { StepThreeForm };

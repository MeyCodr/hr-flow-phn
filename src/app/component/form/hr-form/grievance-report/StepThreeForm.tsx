import CheckBox from "@/app/component/ui/CheckBox";
import { Input } from "@/app/component/ui/Input";
import Label from "@/app/component/ui/Label";
import { GrievanceReportTypes } from "@/app/types/types";
import { complaintOptions } from "../../../../../../lib/data";
import { TextArea } from "@/app/component/ui/TextArea";

interface StepThree {
  data: GrievanceReportTypes;
  handleTextAreaChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

/* ✅ You can replace with real input fields */
function StepThreeForm({ data, handleTextAreaChange }: StepThree) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <h2 className="font-semibold text-sm mb-4">
          Attempts to Resolve The Issue (Cubaan Awal Untuk Menyelesaikan Isu)
        </h2>
        <h2 className="font-semibold text-sm mb-4">
          Preferred Outcome (Penyelesaian Yang Diharapkan)
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
              value={data.attemptsResolve}
              onChange={handleTextAreaChange}
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
              value={data.preferredOutcome}
              onChange={handleTextAreaChange}
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

import CheckBox from "@/app/component/ui/CheckBox";
import { Input } from "@/app/component/ui/Input";
import Label from "@/app/component/ui/Label";
import { GrievanceReportTypes } from "@/app/types/types";
import { complaintOptions } from "../../../../../../lib/data";
import { TextArea } from "@/app/component/ui/TextArea";

interface StepTwo {
  data: GrievanceReportTypes;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleChangeCheckbox: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleTextAreaChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

/* ✅ You can replace with real input fields */
function StepTwoForm({
  data,
  handleChange,
  handleChangeCheckbox,
  handleTextAreaChange,
}: StepTwo) {
  return (
    <>
      <h2 className="font-semibold text-sm mb-4">
        Type of Complaint (Jenis Aduan)
      </h2>
      <div className="w-full border-b mb-4 border-indigo-800/20"></div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="text-xs">
          {complaintOptions.map((option, i) => (
            <div
              key={i}
              className="flex items-center gap-4 mb-2 cursor-pointer"
              onClick={() =>
                handleChangeCheckbox({
                  target: {
                    name: "complaintTypes",
                    value:
                      data.complaintTypes === option.value ? "" : option.value,
                  },
                } as React.ChangeEvent<HTMLInputElement>)
              }
            >
              <CheckBox
                checked={data.complaintTypes === option.value}
                onChange={() =>
                  handleChangeCheckbox({
                    target: {
                      name: "complaintTypes",
                      value:
                        data.complaintTypes === option.value
                          ? ""
                          : option.value,
                    },
                  } as React.ChangeEvent<HTMLInputElement>)
                }
              />
              <Label
                name={option.label}
                htmlFor={option.value}
                className="cursor-pointer"
              />
            </div>
          ))}

          {data.complaintTypes === "Other" && (
            <div className="mt-4 flex flex-col gap-y-2">
              <Label
                name="Please specify / Sila Nyatakan"
                htmlFor="others"
                className="block text-sm font-medium text-gray-900"
              />
              <Input
                id="others"
                name="others"
                type="text"
                value={data.others}
                onChange={handleChange}
                placeholder="Type here..."
                required
                className="w-full border border-gray-300 rounded-md py-2 px-3 text-xs focus:ring-indigo-500"
              />
            </div>
          )}
        </div>
        <div className="text-xs">
          <div className="flex-1 flex flex-col space-y-2">
            <Label
              name={`  Provide clear and detailed description of the issue, including
              relevant dates, locations, individuals involved, etc. (Sila
              nyatakan secara jelas dan terperinci berkenaan isu termasuk
              tarikh, lokasi, individu terlibat dan lain-lain yang berkenaan).`}
              htmlFor="detailComplaints"
              className=""
            />
            <TextArea
              id="detailComplaints"
              name="detailComplaints"
              value={data.detailComplaints}
              onChange={handleTextAreaChange}
              rows={6}
              placeholder="Detail of Complaints"
              className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-900 placeholder:text-gray-400 placeholder:text-xs text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>
    </>
  );
}

export { StepTwoForm };

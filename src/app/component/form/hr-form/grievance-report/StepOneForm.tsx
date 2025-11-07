import { Input } from "@/app/component/ui/Input";
import Label from "@/app/component/ui/Label";
import { GrievanceReportTypes } from "@/app/types/types";

interface StepOne {
  data: GrievanceReportTypes;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/* ✅ You can replace with real input fields */
function StepOneForm({ data, handleChange }: StepOne) {
  return (
    <>
      <h2 className="font-semibold text-sm mb-4 text-center">
        Complainer's Detail (Maklumat Peribadi)
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-y-6">
          <div className="flex flex-col space-y-2">
            <Label
              name="Full Name/Nama Penuh"
              htmlFor="fullname"
              className="block text-xs font-medium text-gray-900"
            />
            <Input
              id="fullname"
              name="fullname"
              type="text"
              value={data.fullname}
              onChange={handleChange}
              placeholder="Full Name"
              required
              className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-900 placeholder:text-gray-400 placeholder:text-xs text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex flex-col space-y-2">
            <Label
              name="Staff Number/No. Staff"
              htmlFor="staffId"
              className="block text-xs font-medium text-gray-900"
            />
            <Input
              id="staffId"
              name="staffId"
              type="text"
              value={data.staffId}
              onChange={handleChange}
              placeholder="Staff Id"
              required
              className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-900 placeholder:text-gray-400 placeholder:text-xs text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex flex-col space-y-2">
            <Label
              name="Department/Jabatan"
              htmlFor="department"
              className="block text-xs font-medium text-gray-900"
            />
            <Input
              id="department"
              name="department"
              type="text"
              value={data.department}
              onChange={handleChange}
              placeholder="Department"
              required
              className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-900 placeholder:text-gray-400 placeholder:text-xs text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex flex-col gap-y-6">
          <div className="flex flex-col gap-y-6">
            <div className="flex flex-col space-y-2">
              <Label
                name="Contact No./No untuk dihubungi"
                htmlFor="contactNo"
                className="block text-xs font-medium text-gray-900"
              />
              <Input
                id="contactNo"
                name="contactNo"
                type="text"
                value={data.contactNo}
                onChange={handleChange}
                placeholder="Contact No"
                required
                className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-900 placeholder:text-gray-400 placeholder:text-xs text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex flex-col space-y-2">
              <Label
                name="Designation/Jawatan"
                htmlFor="designation"
                className="block text-xs font-medium text-gray-900"
              />
              <Input
                id="designation"
                name="designation"
                type="text"
                value={data.designation}
                onChange={handleChange}
                placeholder="Designation"
                required
                className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-900 placeholder:text-gray-400 placeholder:text-xs text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex flex-col space-y-2">
              <Label
                name="Date of Complaint/Tarikh Aduan"
                htmlFor="dateOfComplaint"
                className="block text-xs font-medium text-gray-900"
              />
              <Input
                id="dateOfComplaint"
                name="dateOfComplaint"
                type="text"
                value={data.dateOfComplaint ?? ""}
                onChange={handleChange}
                placeholder="dateOfComplaint"
                required
                className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-900 placeholder:text-gray-400 placeholder:text-xs text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export { StepOneForm };

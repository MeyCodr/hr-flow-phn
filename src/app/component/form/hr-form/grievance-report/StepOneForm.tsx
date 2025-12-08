import ComboBox from "@/app/component/ui/ComboBox";
import { Input } from "@/app/component/ui/Input";
import Label from "@/app/component/ui/Label";
import {
  Department,
  Division,
  GrievanceReportTypes,
  Section,
  UserInfo,
} from "@/app/types/types";
import { useEffect } from "react";
import {
  addDashOption,
  formatPhoneNumber,
  getCurrentDateTime,
} from "../../../../../../lib/utils";

interface StepOne {
  data: GrievanceReportTypes;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  divisions: Division[];
  departments: Department[];
  sections: Section[];
  setSelectedDivision: React.Dispatch<React.SetStateAction<string>>;
  setSelectedDepartment: React.Dispatch<React.SetStateAction<string>>;
  setSelectedSection: React.Dispatch<React.SetStateAction<string>>;
  setData: React.Dispatch<React.SetStateAction<GrievanceReportTypes>>;
  userInfo?: UserInfo;
  readOnly?: boolean;
  parsedData?: GrievanceReportTypes;
}

/* ✅ You can replace with real input fields */
function StepOneForm({
  data,
  handleChange,
  divisions,
  departments,
  sections,
  setSelectedDivision,
  setSelectedDepartment,
  setSelectedSection,
  setData,
  userInfo,
  readOnly,
  parsedData,
}: StepOne) {
  useEffect(() => {
    if (!userInfo) return;

    setData((prev) => ({
      ...prev,
      division: userInfo.divisionId ? userInfo.divisionId.toString() : "",
      department: userInfo.departmentId ? userInfo.departmentId.toString() : "",
      section: userInfo.sectionId ? userInfo.sectionId.toString() : "",
      staffId: userInfo.staffid ? userInfo.staffid.toString() : "",
      fullname: userInfo.fullname ? userInfo.fullname.toString() : "",
      dateOfComplaint: getCurrentDateTime().toString(),
    }));

    if (userInfo.divisionId)
      setSelectedDivision(userInfo.divisionId.toString());
    if (userInfo.departmentId)
      setSelectedDepartment(userInfo.departmentId.toString());
    if (userInfo.sectionId) setSelectedSection(userInfo.sectionId.toString());
  }, [
    userInfo,
    setSelectedDivision,
    setSelectedDepartment,
    setSelectedSection,
  ]);

  const formData = readOnly && parsedData ? parsedData : data;

  if (!userInfo) {
    return (
      <div className="flex justify-center items-center h-[300px] bg-white my-6 p-6 rounded-lg border border-gray-300 shadow-xs">
        <p className="text-center text-sm text-gray-500">
          Loading user info ...
        </p>
      </div>
    );
  }

  return (
    <>
      <h2 className="font-semibold text-sm mb-4 text-center">
        Complainer&apos;s Detail (Maklumat Peribadi)
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
              value={formData.fullname ?? ""}
              onChange={handleChange}
              placeholder="Full Name"
              required
              disabled
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
              value={readOnly ? formData.staffId : userInfo.staffid}
              onChange={handleChange}
              placeholder="Staff Id"
              required
              disabled
              className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-900 placeholder:text-gray-400 placeholder:text-xs text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex flex-col space-y-2">
            <Label
              name="Division"
              htmlFor="division"
              className="block text-sm font-medium text-gray-900"
            />
            <ComboBox
              menu={divisions}
              selectedValue={formData ? formData.division : data.division} // ✅ controlled
              onSelect={(item) => {
                const value = item ? item.id.toString() : "";
                setSelectedDivision(value);
                setSelectedDepartment("");
                setSelectedSection("");
                setData((prev) => ({
                  ...prev,
                  division: value,
                  department: "",
                  section: "",
                }));
              }}
              disabled
            />
          </div>
          <div className="flex flex-col space-y-2">
            <Label
              name="Department"
              htmlFor="department"
              className="block text-sm font-medium text-gray-900"
            />
            <ComboBox
              menu={addDashOption(departments)}
              selectedValue={
                formData?.departmentName ?? formData.department ?? ""
              } // ✅ controlled
              onSelect={(item) => {
                const value =
                  item && item.name !== "-" ? item.id.toString() : "";
                setSelectedDepartment(value);
                setSelectedSection("");
                setData((prev) => ({
                  ...prev,
                  department: value,
                  section: "",
                }));
              }}
              disabled
            />
          </div>
        </div>

        <div className="flex flex-col gap-y-6">
          <div className="flex flex-col gap-y-6">
            <div className="flex flex-col space-y-2">
              <Label
                name="Section"
                htmlFor="section"
                className="block text-sm font-medium text-gray-900"
              />
              <ComboBox
                menu={addDashOption(sections)}
                selectedValue={formData?.sectionName ?? formData.section ?? ""}
                onSelect={(item) => {
                  const value =
                    item && item.name !== "-" ? item.id.toString() : "";
                  setSelectedSection(value);
                  setData((prev) => ({ ...prev, section: value }));
                }}
                disabled
              />
            </div>
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
                // value={formatPhoneNumber(data.contactNo)}
                value={
                  readOnly
                    ? formatPhoneNumber(parsedData?.contactNo ?? "")
                    : formatPhoneNumber(data.contactNo)
                }
                onChange={readOnly ? () => {} : handleChange}
                disabled={readOnly}
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
                value={formData.designation ?? ""}
                onChange={handleChange}
                placeholder="Designation"
                required
                disabled
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
                value={
                  readOnly
                    ? parsedData?.dateOfComplaint ?? ""
                    : getCurrentDateTime()
                }
                onChange={readOnly ? () => {} : handleChange}
                placeholder="Date of Complaint"
                required
                disabled
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

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
import { useEffect, useState } from "react";
import { addDashOption, getCurrentDateTime } from "../../../../../../lib/utils";

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

  if(!userInfo){
    return (
      <p>Loading user info ...</p>
    )
  }
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
              value={userInfo.fullname}
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
              value={userInfo.staffid}
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
              selectedValue={data.division} // ✅ controlled
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
              selectedValue={data.department}
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
                selectedValue={data.section}
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
                value={getCurrentDateTime()}
                onChange={handleChange}
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

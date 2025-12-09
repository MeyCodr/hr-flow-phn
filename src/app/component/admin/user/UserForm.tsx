import { Department, Division, Section, UserType } from "@/app/types/types";
import Label from "../../ui/Label";
import { Input } from "../../ui/Input";
import { useState } from "react";
import ComboBox from "../../ui/ComboBox";
import { roles } from "../../../../../lib/data";
import PrimaryButton from "../../ui/PrimaryButton";
import { IoReturnDownBack } from "react-icons/io5";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { Role } from "@/generated/client";


interface UserFormProps {
  user: UserType;
  onBack: () => void;
  divisions: Division[];
  departments: Department[];
  sections: Section[];
  setSelectedDivision: (id: string) => void;
  setSelectedDepartment: (id: string) => void;
  onUpdate: () => void;
}

function UserForm({
  user,
  onBack,
  divisions,
  departments,
  sections,
  setSelectedDivision,
  setSelectedDepartment,
  onUpdate,
}: UserFormProps) {
  const [data, setData] = useState<UserType>(user);
  const [selectedDivision, setDivision] = useState<string>(
    user.division?.name || ""
  );
  const [selectedDepartment, setDepartment] = useState<string>(
    user.department?.name || ""
  );
  const [selectedSection, setSection] = useState<string>(
    user.section?.name || ""
  );
  const styleLink = `flex flex-col gap-y-2`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addDashOption = (menu: { id: number; name: string }[]) => {
    if (!menu.some((item) => item.name === "-")) {
      return [{ id: 0, name: "-" }, ...menu];
    }
    return menu;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await axios.put(`/api/user/${data.staffid}`, data);
      toast.success("Successfully updated user");
      onUpdate(); // 👈 notify parent to refresh data
    } catch (error) {
      console.log(error);
      toast.error("Unable to update the user");
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-xs">
        <Toaster position="top-right" />
      </div>
      <PrimaryButton
        name="Back to list"
        icon={<IoReturnDownBack className="w-5 h-5" />}
        onClick={onBack}
        className="text-indigo-800 hover:text-indigo-800 text-xs font-medium cursor-pointer"
      />

      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Edit User: {data.fullname ?? ""} ({data.staffid ?? ""})
      </h2>

      <form className="space-y-4 flex flex-col gap-2" onSubmit={handleSubmit}>
        <div className={styleLink}>
          <Label
            name="Full Name"
            htmlFor="fullname"
            className="block text-sm font-medium text-gray-900"
          />
          <Input
            id="fullname"
            name="fullname"
            type="text"
            value={data.fullname ?? ""}
            onChange={handleChange}
            placeholder="Full Name"
            required
            className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-900 placeholder:text-gray-400 placeholder:text-xs text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className={styleLink}>
          <Label
            name="Email"
            htmlFor="email"
            className="block text-sm font-medium text-gray-900"
          />
          <Input
            id="email"
            name="email"
            type="text"
            value={data.email ?? ""}
            onChange={handleChange}
            placeholder="Email"
            required
            className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-900 placeholder:text-gray-400 placeholder:text-xs text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className={styleLink}>
          <Label
            name="Staff Id"
            htmlFor="staffid"
            className="block text-sm font-medium text-gray-900"
          />
          <Input
            id="staffid"
            name="staffid"
            type="text"
            value={data.staffid ?? ""}
            onChange={handleChange}
            placeholder="Staff Id"
            required
            className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-900 placeholder:text-gray-400 placeholder:text-xs text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className={styleLink}>
          <Label
            name="Division"
            htmlFor="division"
            className="block text-sm font-medium text-gray-900"
          />
          <ComboBox
            menu={addDashOption(divisions)}
            selectedValue={selectedDivision}
            onSelect={(item) => {
              const value = item ? item.name : "";
              setDivision(value);
              setSelectedDivision(item?.id.toString() || "");
              setDepartment("");
              setSection("");
              setSelectedDepartment("");

              setData((prev) => ({
                ...prev,
                // division: item
                //   ? {
                //       id: Number(item.id), // ✅ ensure number
                //       name: item.name,
                //     }
                //   : null,
                divisionId: item ? Number(item.id) : null,
                department: null,
                section: null,
              }));
            }}
          />
        </div>
        <div className={styleLink}>
          <Label
            name="Department"
            htmlFor="department"
            className="block text-sm font-medium text-gray-900"
          />
          <ComboBox
            menu={addDashOption(departments)}
            selectedValue={selectedDepartment}
            onSelect={(item) => {
              const value = item ? item.name : "";
              setDepartment(value);
              setSelectedDepartment(item?.id.toString() || "");
              setSection("");

              setData((prev) => ({
                ...prev,
                // department: item
                //   ? {
                //       id: Number(item.id),
                //       name: item.name,
                //     }
                //   : null,
                departmentId: item ? Number(item.id) : null,
                section: null,
              }));
            }}
          />
        </div>
        <div className={styleLink}>
          <Label
            name="Section"
            htmlFor="section"
            className="block text-sm font-medium text-gray-900"
          />
          <ComboBox
            menu={addDashOption(sections)}
            selectedValue={selectedSection}
            onSelect={(item) => {
              const value = item ? item.name : "";
              setSection(value);

              setData((prev) => ({
                ...prev,
                // section: item
                //   ? {
                //       id: Number(item.id),
                //       name: item.name,
                //     }
                //   : null,
                sectionId: item ? Number(item.id) : null,
              }));
            }}
          />
        </div>
        <div className={styleLink}>
          <Label
            name="Designation"
            htmlFor="designation"
            className="block text-sm font-medium text-gray-900"
          />
          <Input
            id="designation"
            name="designation"
            type="text"
            value={data.designation ?? ""}
            onChange={handleChange}
            placeholder="Designation"
            required
            className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-900 placeholder:text-gray-400 placeholder:text-xs text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className={styleLink}>
          <Label
            name="Role"
            htmlFor="role"
            className="block text-sm font-medium text-gray-900"
          />
          <ComboBox
            menu={roles}
            selectedValue={data.role}
            onSelect={(item) => {
              setData((prev) => ({
                ...prev,
                role: item?.id as Role, // cast to Role type
              }));
            }}
          />
        </div>
        <div className="flex justify-end">
          <PrimaryButton
            name="Save Changes"
            type="submit"
            className="bg-indigo-800 max-w-3xs flex text-xs cursor-pointer text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          />
        </div>
      </form>
    </div>
  );
}

export { UserForm };

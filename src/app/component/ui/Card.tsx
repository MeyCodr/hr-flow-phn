import { SiTicktick } from "react-icons/si";
import PrimaryButton from "./PrimaryButton";
import { IoIosArrowForward } from "react-icons/io";

interface CardProps {
  formId: number;
  title: string;
  description: string;
  approvals: number;
  onClick?: () => void; // added
  icon?: React.ReactNode;
}

export default function Card({
  title,
  description,
  approvals,
  onClick, // added
  icon,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className="group w-full bg-white border border-gray-300 rounded-xl p-5 py-6 shadow-xs hover:scale-105 cursor-pointer ease-in-out duration-300 transition-all hover:shadow-lg"
    >
      {icon}
      {/* <FiUserPlus className="w-12 h-12 rounded-xl bg-purple-200 text-indigo-800 p-3 group-hover:scale-105 ease-in-out duration-300 transition-all" /> */}

      <div className="flex flex-col gap-y-2 my-6">
        <h1 className="font-semibold">{title}</h1>
        <p className="text-xs text-indigo-800">{description}</p>
      </div>

      <div className="flex justify-between items-center gap-x-4">
        <div className="flex items-center gap-x-2">
          <SiTicktick className="w-3 h-3" />
          <span className="text-xs">{approvals} approvals</span>
        </div>
        <PrimaryButton
          name="Start"
          type="button"
          className="text-sm cursor-pointer flex flex-row-reverse transform transition-all duration-300 group-hover:bg-indigo-800 group-hover:text-white px-2 py-1 rounded-md"
          icon={<IoIosArrowForward className="w-4 h-4" />}
        />
      </div>
    </div>
  );
}

import React from "react";
import PrimaryButton from "./PrimaryButton";
import { IoIosArrowForward, IoMdMan } from "react-icons/io";
import { IoManOutline } from "react-icons/io5";
import { FaUserPlus } from "react-icons/fa";
import { FiUserPlus } from "react-icons/fi";
import { PiStickerLight } from "react-icons/pi";
import { SiTicktick } from "react-icons/si";

export default function Card() {
  const cards = [1, 2, 3];
  return (
    <>
      {cards.map((_, index) => (
        <div
          key={index}
          className="group w-full bg-white border border-gray-200 rounded-xl p-5 py-6 shadow-xs hover:scale-105 cursor-pointer ease-in-out duration-300 transition-all hover:shadow-lg"
        >
          <FiUserPlus className="w-12 h-12  rounded-xl bg-purple-200 text-indigo-800 p-3 group-hover:scale-105 ease-in-out duration-300 transition-all" />

          <div className="flex flex-col gap-y-2 my-6">
            {/* title */}
            <h1 className="font-semibold">Leave Request</h1> 
            {/* description */}
            <p className="text-xs text-indigo-800">
              Request time off for vacation, sick leave or personal reasons
            </p>
          </div>

          <div className="flex justify-between items-center gap-x-4">
            {/* number of approvals */}
            <div className="flex items-center gap-x-2">
              <SiTicktick className="w-3 h-3"/>
              <span className="text-xs ">2 approvals</span>
            </div>
            <PrimaryButton
              name="Start"
              type="button"
              className="text-sm flex flex-row-reverse transform transition-all duration-300 group-hover:bg-indigo-800 group-hover:text-white px-2 py-1 rounded-md"
              icon={<IoIosArrowForward className="w-4 h-4" />}
            />
          </div>
        </div>
      ))}
    </>
  );
}

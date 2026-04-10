"use client";

import Image from "next/image";
import React, { useRef, useState } from "react";
import { ProfileComponentProps } from "./ProfileComponent";
import {
  LuMail,
  LuLayers,
  LuUsers,
  LuLayoutDashboard,
  LuMapPin,
  LuCamera,
} from "react-icons/lu";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { withBasePath } from "@/lib/base-path";

export default function DisplayProfile({
  userProfile,
  userSession,
}: ProfileComponentProps) {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setProfileImage(reader.result as string);
    reader.readAsDataURL(file);

    // Upload to API
    try {
      const formData = new FormData();
      formData.append("file", file);

      await axios.post(withBasePath(`/api/user/${userSession?.staffid}`), formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Profile image succesful uploaded!");
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Unable to upload image");
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const initials = userProfile?.fullname
    ? userProfile.fullname
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "JD";

  return (
    <>
      <div className="text-xs">
        <Toaster position="top-right" />
      </div>
      <div className="w-full bg-white p-4 flex flex-col justify-center items-center relative overflow-hidden">
        {/* Avatar */}
        <div className="relative">
          <div
            className="w-28 h-28 rounded-full bg-indigo-800 flex items-center justify-center text-white text-2xl font-semibold overflow-hidden cursor-pointer"
            onClick={handleClick}
          >
            {profileImage ? (
              <Image
                src={profileImage}
                alt="Profile"
                fill
                sizes="112px"
                className="object-cover w-full h-full"
              />
            ) : userProfile?.attachment ? (
              <Image
                src={userProfile.attachment}
                alt="Profile"
                fill
                sizes="112px"
                className="object-cover w-full h-full"
              />
            ) : (
              <span>{initials}</span>
            )}
          </div>

          {/* Always visible small camera icon badge */}
          <div
            onClick={handleClick}
            className="absolute bottom-1 right-1 bg-indigo-800 rounded-full p-2 cursor-pointer shadow-md hover:bg-indigo-700 transition"
          >
            <LuCamera className="text-white w-4 h-4" />
          </div>

          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        {/* Info */}
        <div className="grid grid-cols-1 gap-y-4 my-4 w-full">
          <div className="text-center">
            <p className="text-xl font-semibold">{userProfile?.fullname}</p>
            <p className="text-indigo-800 font-light text-sm">
              {(userProfile?.designation ?? "").toUpperCase()}
            </p>
          </div>

          <div>
            <p className="w-fit mx-auto rounded-full bg-indigo-800 text-white py-1 px-4 border border-indigo-800 text-xs">
              {userProfile?.role}
            </p>
          </div>

          <div className="w-full border-t border-indigo-800/30 my-4"></div>

          {/* Details */}
          <div className="flex flex-col items-start w-full gap-2 text-sm">
            <div className="flex items-center gap-3 break-all">
              <LuMail className="text-indigo-800 w-5 h-5" />
              <p>{userProfile?.email}</p>
            </div>
            <div className="flex items-center gap-3 break-words">
              <LuLayers className="text-indigo-800 w-5 h-5" />
              <p>{userProfile?.division?.name}</p>
            </div>
            <div className="flex items-center gap-3 break-all">
              <LuUsers className="text-indigo-800 w-5 h-5" />
              <p>{userProfile?.department?.name}</p>
            </div>
            <div className="flex items-center gap-3 break-all">
              <LuLayoutDashboard className="text-indigo-800 w-5 h-5" />
              <p>{userProfile?.section?.name}</p>
            </div>
            <div className="flex items-center gap-3 break-words">
              <LuMapPin className="text-indigo-800 w-5 h-5" />
              <p>{userProfile?.workLocation}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

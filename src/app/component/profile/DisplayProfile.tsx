import { ProfileComponentProps } from "./ProfileComponent";
import {
  LuMail,
  LuLayers,
  LuUsers,
  LuLayoutDashboard,
  LuMapPin,
} from "react-icons/lu";

export default function DisplayProfile({ userProfile }: ProfileComponentProps) {
  return (
    <div className="w-full bg-white p-4 flex flex-col justify-center items-center relative overflow-hidden">
      {/* Avatar */}
      <div>
        <div className="w-28 h-28 rounded-full bg-indigo-800 flex items-center justify-center text-white text-2xl font-semibold">
          JD
        </div>
      </div>

      {/* Info */}
      <div className="grid grid-cols-1 gap-y-4 text-center my-4 w-full">
        <div>
          <p className="text-xl font-semibold">{userProfile?.fullname}</p>
          <p className="text-indigo-800 font-light text-sm">
            {(userProfile?.designation ?? "").toUpperCase()}
          </p>
        </div>

        <div>
          <p className="w-fit mx-auto rounded-full bg-indigo-800 text-white py-1 px-2 border border-black text-xs">
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
  );
}

"use client";

import { useEffect, useState } from "react";
import { Department, Division, Section, UserType } from "@/app/types/types";
import { UserForm } from "./UserForm";
import axios from "axios";
import { motion, AnimatePresence, Variants } from "framer-motion";

interface UserListingProps {
  userListing: UserType[];
  divisions: Division[];
  departments: Department[];
  sections: Section[];
  setSelectedDivision: (id: string) => void;
  setSelectedDepartment: (id: string) => void;
}

export default function UserListing({
  userListing,
  divisions,
  departments,
  sections,
  setSelectedDivision,
  setSelectedDepartment,
}: UserListingProps) {
  const [users, setUsers] = useState<UserType[]>(
    Array.isArray(userListing) ? userListing : []
  );
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRowClick = (user: UserType) => {
    setSelectedUser(user);
  };

  const handleBack = () => {
    setSelectedUser(null);
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/user");
      const data = res.data;
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUserUpdated = async () => {
    await fetchUsers();
    setSelectedUser(null);
  };

  // Framer Motion variants
  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
    exit: { opacity: 0, x: -50, transition: { duration: 0.3, ease: "easeIn" } },
  };

  return (
    <div className="">
      <AnimatePresence mode="wait">
        {!selectedUser ? (
          <motion.div
            key="list-view"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={containerVariants}
            className="p-6 w-full bg-white rounded-lg border border-gray-300"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              User Listing
            </h2>

            {loading ? (
              <p className="text-center text-sm text-gray-500 py-6">
                Loading latest user listing ...
              </p>
            ) : (
              <>
                <div className="w-full overflow-x-auto">
                  <table className="min-w-[1200px] w-full text-xs text-left border border-gray-300 rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-indigo-800 text-white">
                        <th className="px-4 py-3 font-semibold">No</th>
                        <th className="px-4 py-3 font-semibold">Full Name</th>
                        <th className="px-4 py-3 font-semibold text-nowrap">
                          Staff ID
                        </th>
                        <th className="px-4 py-3 font-semibold">Email</th>
                        <th className="px-4 py-3 font-semibold">Division</th>
                        <th className="px-4 py-3 font-semibold">Department</th>
                        <th className="px-4 py-3 font-semibold">Section</th>
                        <th className="px-4 py-3 font-semibold">Designation</th>
                        <th className="px-4 py-3 font-semibold text-nowrap">
                          Work Location
                        </th>
                        <th className="px-4 py-3 font-semibold">Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {users.map((user, i) => (
                        <tr
                          key={i}
                          onClick={() => handleRowClick(user)}
                          className="hover:bg-indigo-50 transition cursor-pointer"
                        >
                          <td className="px-4 py-3 font-medium text-gray-700">
                            {i + 1}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {user.fullname}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {user.staffid}
                          </td>
                          <td className="px-4 py-3 text-indigo-700 font-medium whitespace-nowrap">
                            {user.email}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {user.division?.name || "-"}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {user.department?.name || "-"}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {user.section?.name || "-"}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {user.designation}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {user.workLocation}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                user.role === "Admin"
                                  ? "bg-indigo-100 text-indigo-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {user.role}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-gray-500 mt-3 text-center sm:hidden">
                  👉 Swipe left/right to view more columns
                </p>
              </>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="form-view"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0, transition: { duration: 0.4 } }}
            exit={{ opacity: 0, x: -50, transition: { duration: 0.3 } }}
            className="p-6 w-full bg-white rounded-lg border border-gray-300"
          >
            <UserForm
              user={selectedUser}
              onBack={handleBack}
              onUpdate={handleUserUpdated}
              divisions={divisions}
              departments={departments}
              sections={sections}
              setSelectedDivision={setSelectedDivision}
              setSelectedDepartment={setSelectedDepartment}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

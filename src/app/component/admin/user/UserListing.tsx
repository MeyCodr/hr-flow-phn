"use client";

import { useEffect, useState } from "react";
import { Department, Division, Section, UserType } from "@/app/types/types";
import { UserForm } from "./UserForm";
import axios from "axios";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { withBasePath } from "@/lib/base-path";
import ApprovalTable from "../../ui/ApprovalTable";
import { FiSearch } from "react-icons/fi";

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
  const [searchQuery, setSearchQuery] = useState("");

  const handleRowClick = (user: UserType) => {
    setSelectedUser(user);
  };

  const handleBack = () => {
    setSelectedUser(null);
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(withBasePath("/api/user"));
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

  const sortedUsers = [...users].sort((a, b) => a.fullname.localeCompare(b.fullname));

  const query = searchQuery.trim().toLowerCase();
  const filteredUsers = query
    ? sortedUsers.filter((user) =>
        [
          user.fullname,
          user.staffid,
          user.email,
          user.division?.name,
          user.department?.name,
          user.section?.name,
          user.designation,
          user.workLocation,
          user.role,
        ]
          .filter((field): field is string => Boolean(field))
          .some((field) => field.toLowerCase().includes(query)),
      )
    : sortedUsers;

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
            <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
              <h2 className="text-xl font-semibold text-gray-800">
                User Listing
              </h2>

              <div className="relative w-full sm:w-64">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users..."
                  className="w-full border border-gray-300 rounded-md pl-9 pr-3 py-2 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {loading ? (
              <p className="text-center text-sm text-gray-500 py-6">
                Loading latest user listing ...
              </p>
            ) : (
              <>
                <ApprovalTable
                  items={filteredUsers}
                  pageSize={20}
                  emptyMessage={query ? "No users match your search." : "No users found."}
                  columns={[
                    { label: "Full Name", sortAccessor: (u) => u.fullname },
                    { label: "Staff ID", sortAccessor: (u) => u.staffid },
                    { label: "Email", sortAccessor: (u) => u.email },
                    { label: "Division", sortAccessor: (u) => u.division?.name },
                    { label: "Department", sortAccessor: (u) => u.department?.name },
                    { label: "Section", sortAccessor: (u) => u.section?.name },
                    { label: "Designation", sortAccessor: (u) => u.designation },
                    { label: "Role", sortAccessor: (u) => u.role },
                  ]}
                  renderRow={(user, i) => (
                    <tr
                      key={i}
                      onClick={() => handleRowClick(user)}
                      className="cursor-pointer divide-x divide-gray-100 border-b border-gray-100 last:border-0 hover:bg-indigo-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-xs font-medium text-indigo-700 whitespace-nowrap">
                        {user.fullname}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-700 whitespace-nowrap">
                        {user.staffid}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-700 whitespace-nowrap">
                        {user.email}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-700 whitespace-nowrap">
                        {user.division?.name || "-"}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-700 whitespace-nowrap">
                        {user.department?.name || "-"}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-700 whitespace-nowrap">
                        {user.section?.name || "-"}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-700 whitespace-nowrap">
                        {user.designation}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`text-[0.6rem] font-semibold px-2 py-0.5 rounded-full ${
                            user.role === "Admin"
                              ? "bg-indigo-100 text-indigo-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                    </tr>
                  )}
                />
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

import React from "react";
import DashboardCard from "./DashboardCard";
import { FiFileText, FiCheckCircle, FiUsers, FiLayers } from "react-icons/fi";
import QuickActions from "./QuickActions";

interface DashboardComponentProps {
  countPendingForms: number;
  countApprovedForms: number;
  totalForms: number;
  totalMembers: number;
}

export default function DashboardComponent({
  countPendingForms,
  countApprovedForms,
  totalForms,
  totalMembers,
}: DashboardComponentProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good morning, Amir! ☀️";
    if (hour >= 12 && hour < 18) return "Good afternoon, Amir! 🌤️";
    if (hour >= 18 && hour < 22) return "Good evening, Amir! 🌙";
    return "Hello, Amir! 🌟";
  };

  return (
    <div className="font-poppins w-full">
      {/* Greeting */}
      <div className="">
        <h1 className="font-bold text-3xl">{getGreeting()}</h1>
        <p className="text-indigo-800 mt-1">
          Welcome back! Here&apos;s a quick overview of your HR forms today.
        </p>
      </div>

      {/* Dashboard Grid */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 my-6">
        <DashboardCard
          name="Pending Forms"
          count={countPendingForms}
          icon={<FiFileText />}
          color="yellow"
          nameColor="yellow-600"
        />
        <DashboardCard
          name="Approved"
          count={countApprovedForms}
          icon={<FiCheckCircle />}
          color="green"
          nameColor="green-600"
        />
        <DashboardCard
          name="Total Forms"
          count={totalForms}
          icon={<FiLayers />}
          color="blue"
          nameColor="blue-600"
        />
        <DashboardCard
          name="Total Members"
          count={totalMembers}
          icon={<FiUsers />}
          color="purple"
          nameColor="purple-600"
        />
      </div>

      <div>
        <QuickActions />
      </div>
    </div>
  );
}

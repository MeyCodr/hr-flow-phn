import React from "react";
import BannerCard from "../../ui/BannerCard";
import { SelfForm, UserType } from "@/app/types/types";

interface SubmissionContentProps {
  formsWithLevels: SelfForm[];
  user: UserType;
  onViewForm: (formId: number, formName: string) => void; 
}

export default function SubmissionContent({
  formsWithLevels,
  user,
  onViewForm,
}: SubmissionContentProps) {
  // User’s own submitted forms
  const myFormsContent =
    formsWithLevels.length > 0 ? (
      <div className="flex flex-col gap-4">
        {formsWithLevels.map((form) => (
          <BannerCard
            key={form.id}
            profileImg={""}
            title={form.formType.name}
            name={"You"}
            createddate={new Date(form.createdAt).toLocaleDateString()}
            remarks={form.formData?.remarks as string || "No remarks yet"}
            currentLevel={form.currentLevel ?? 0}
            totalLevel={form.totalLevel ?? 0}
            activeLevel={form.activeLevel}
            roles={user.role}
            status={form.status}
            onClick={() => onViewForm(form.id, form.formType.name)}
          />
        ))}
      </div>
    ) : (
      <p className="text-gray-600">You have no submitted forms.</p>
    );

  return <div>{myFormsContent}</div>;
}

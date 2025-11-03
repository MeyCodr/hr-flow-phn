import React from "react";
import BannerCard from "../../ui/BannerCard";
import { SelfForm, UserType } from "@/app/types/types";
import PaginatedList from "../../ui/PaginatedList";

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
  if (formsWithLevels.length === 0) {
    return <p className="text-gray-600">You have no submitted forms.</p>;
  }

  return (
    <PaginatedList
      items={formsWithLevels}
      pageSize={10}
      renderItem={(form) => (
        <BannerCard
          key={form.id}
          profileImg={user.attachment || ""}
          title={form.formType.name}
          name={"You"}
          createddate={new Date(form.createdAt).toLocaleDateString()}
          remarks={(form.formData?.remarks as string) || "No remarks yet"}
          currentLevel={form.currentLevel ?? 0}
          totalLevel={form.totalLevel ?? 0}
          activeLevel={form.activeLevel ?? 0}
          roles={user.role}
          status={form.status}
          onClick={() => onViewForm(form.id, form.formType.name)}
        />
      )}
    />
  );
}

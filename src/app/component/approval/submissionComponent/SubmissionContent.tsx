import React from "react";
import BannerTableRow from "../../ui/BannerTableRow";
import ApprovalTable from "../../ui/ApprovalTable";
import { SelfForm, UserType } from "@/app/types/types";
import { getLastApprovalDate } from "../approvalDateUtils";

interface SubmissionContentProps {
  formsWithLevels: SelfForm[];
  user: UserType;
  onViewForm: (formId: number, formName: string, source: "submissions") => void;
}

export default function SubmissionContent({
  formsWithLevels,
  user,
  onViewForm,
}: SubmissionContentProps) {
  return (
    <ApprovalTable
      items={formsWithLevels}
      pageSize={20}
      columns={[
        { label: "Requester" },
        { label: "Form Type" },
        { label: "Department" },
        { label: "Date", sortAccessor: (form) => form.createdAt },
        { label: "Level" },
        { label: "Status", sortAccessor: (form) => form.status },
        {
          label: "Last Approval Date",
          sortAccessor: (form) => getLastApprovalDate(form.approvals),
        },
        { label: "Actions" },
      ]}
      emptyMessage="You have no submitted forms."
      renderRow={(form) => (
        <BannerTableRow
          key={form.id}
          profileImg={user.attachment || ""}
          title={form.formType.name}
          name={"You"}
          department={user.department?.name}
          createddate={form.createdAt}
          lastApprovalDate={getLastApprovalDate(form.approvals)}
          currentLevel={form.currentLevel ?? 0}
          totalLevel={form.totalLevel ?? 0}
          activeLevel={form.activeLevel ?? 0}
          roles={user.role}
          status={form.status}
          onClick={() => onViewForm(form.id, form.formType.name, "submissions")}
        />
      )}
    />
  );
}

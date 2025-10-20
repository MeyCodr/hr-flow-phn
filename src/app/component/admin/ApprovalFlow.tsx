import React from 'react'

interface ApprovalFlowStep {
    id: number;
    createdAt: Date;
    departmentId: number;
    divisionId: number;
    formTypeId: number;
    order: number;
    role: string;
    sectionId: number;
}

interface ApprovalFlow {
    approvalStep: ApprovalFlowStep[] ;
}

export default function ApprovalFlow({approvalStep}:ApprovalFlow) {
  return (
    <>
        <div>

        </div>
    </>
  )
}

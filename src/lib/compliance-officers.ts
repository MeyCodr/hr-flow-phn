import { prisma } from "@/lib/prisma";

// Admins designate compliance officers by creating this FormType in the
// existing Admin > Form Type tab, then manually assigning approver(s) to it
// in the Admin > Approval Flow tab (the same manual-approver mechanism used
// by other forms). Only those manually-assigned users may review reports -
// role/department-based resolution is intentionally not used here.
const SEXUAL_HARASSMENT_FORM_TYPE_NAME = "Sexual Harassment Report";

async function getComplianceOfficerUserIds(): Promise<number[]> {
  const formType = await prisma.formType.findUnique({
    where: { name: SEXUAL_HARASSMENT_FORM_TYPE_NAME },
    include: {
      flowSteps: {
        include: { approvalStepApprovers: true },
      },
    },
  });

  if (!formType) return [];

  const userIds = formType.flowSteps.flatMap((step) =>
    step.approvalStepApprovers.map((approver) => approver.userId),
  );

  return Array.from(new Set(userIds));
}

export async function isComplianceOfficer(
  staffid: string | null | undefined,
): Promise<boolean> {
  if (!staffid) return false;

  const userIds = await getComplianceOfficerUserIds();
  if (userIds.length === 0) return false;

  const user = await prisma.user.findUnique({ where: { staffid } });
  if (!user) return false;

  return userIds.includes(user.id);
}

export async function getComplianceOfficerEmails(): Promise<string[]> {
  const userIds = await getComplianceOfficerUserIds();
  if (userIds.length === 0) return [];

  const officers = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { email: true },
  });

  return officers.map((o) => o.email);
}

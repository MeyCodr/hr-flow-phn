import DashboardComponent from "../component/dashboard/DashboardComponent";
import { prisma } from "../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  console.log("session1234", session);

  if (!session) {
    redirect("/"); //protected page
  }

  const findUser = await prisma.user.findUnique({
    where: {
      staffid: session?.user?.staffid || "",
    },
  });

  const countPendingForms = await prisma.formSubmission.count({
    where: { status: "PENDING", createdById: findUser?.id },
  });

  const countApprovedForms = await prisma.formSubmission.count({
    where: { status: "APPROVED", createdById: findUser?.id },
  });

  const totalForms = await prisma.formType.count();

  const totalMembers = await prisma.user.count();

  console.log("Pending Forms Count:", countPendingForms);

  return (
    <DashboardComponent
      countPendingForms={countPendingForms}
      countApprovedForms={countApprovedForms}
      totalForms={totalForms}
      totalMembers={totalMembers}
      userSession={session}
    />
  );
}

import { prisma } from "../../../../lib/prisma";
import HrFormsClient from "./hr-forms/page";

export default async function Forms() {
  const forms = await prisma.formType.findMany({
    include: {
      flowSteps: true,
    },
  });

  return <HrFormsClient forms={forms} />;
}

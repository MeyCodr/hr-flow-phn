import { prisma } from "../../../../lib/prisma";
import HrFormsClient from "./hr-forms/page";

export default async function Forms() {
  const forms = await prisma.formType.findMany({
    include: {
      flowSteps: true,
    },
  });
  console.log("forms: ", forms);

  return <HrFormsClient forms={forms} />;
}

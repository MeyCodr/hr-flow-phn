import HrFormsClient from "@/app/component/form/hr-form/HrFormsClient";
import { prisma } from "../../../../lib/prisma";

export default async function Forms(props: {
  searchParams: Promise<{ id?: string; name?: string }>;
}) {
  // ✅ Await searchParams first
  const searchParams = await props.searchParams;

  const forms = await prisma.formType.findMany({
    include: { flowSteps: true },
  });

  const id = searchParams.id ? Number(searchParams.id) : null;
  const name = searchParams.name ?? null;

  return <HrFormsClient forms={forms} selectedId={id} selectedName={name} />;
}

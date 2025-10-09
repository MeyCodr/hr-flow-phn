import Card from "@/app/component/ui/Card";
import { prisma } from "../../../../lib/prisma";

export default async function Forms() {

  const forms = await prisma.formType.findMany();
  console.log("forms: ", forms);

  return (
    <div className="font-poppins w-full">
      <div>
        <h1 className="font-bold text-3xl">HR Forms</h1>
        <p className="text-indigo-800">Select a form to submit your request</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-6">
        <Card />
      </div>
    </div>
  );
}

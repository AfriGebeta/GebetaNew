export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/career/auth";
import AddInternClient from "./AddInternClient";

export default async function AddInternPage() {
  const user = await getSessionUser();
  if (!user) redirect("/career/admin");
  return <AddInternClient />;
}

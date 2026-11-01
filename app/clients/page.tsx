import { notFound } from "next/navigation";
import { isLocalClientDirectoryEnabled } from "@/lib/client-directory";
import ClientDirectory from "./client-directory";

export const dynamic = "force-dynamic";

export default function ClientsPage() {
  if (!isLocalClientDirectoryEnabled()) notFound();
  return <ClientDirectory />;
}

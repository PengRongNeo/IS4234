import { BranchDetailView } from "@/components/views/BranchDetailView";
import { branches } from "@/lib/mock";

export function generateStaticParams() {
  return branches.map((b) => ({ id: b.id }));
}

export default async function BranchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BranchDetailView branchId={id} />;
}

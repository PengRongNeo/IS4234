import { BranchDetailView } from "@/components/views/BranchDetailView";

export default async function BranchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BranchDetailView branchId={id} />;
}

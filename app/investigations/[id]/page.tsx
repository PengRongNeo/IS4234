import { InvestigationDetailView } from "@/components/views/InvestigationDetailView";

export default async function InvestigationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <InvestigationDetailView investigationId={id} />;
}

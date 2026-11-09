import { InvestigationDetailView } from "@/components/views/InvestigationDetailView";
import { initialInvestigations } from "@/lib/mock";

export function generateStaticParams() {
  return initialInvestigations.map((i) => ({ id: i.id }));
}

export default async function InvestigationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <InvestigationDetailView investigationId={id} />;
}

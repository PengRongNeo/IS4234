import { AlertDetailView } from "@/components/views/AlertDetailView";
import { initialAlerts } from "@/lib/mock";

export function generateStaticParams() {
  return initialAlerts.map((a) => ({ id: a.id }));
}

export default async function AlertDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AlertDetailView alertId={id} />;
}

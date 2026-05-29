import { SneakerDetailView } from "@/components/products/SneakerDetailView";

interface SneakerDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function SneakerDetailPage({ params }: SneakerDetailPageProps) {
  const { id } = await params;
  return <SneakerDetailView sneakerId={id} />;
}

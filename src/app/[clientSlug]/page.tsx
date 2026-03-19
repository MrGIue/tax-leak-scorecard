import { notFound } from "next/navigation";
import { loadConfig, getAllClientSlugs } from "@/lib/config";
import ScorecardQuiz from "@/components/ScorecardQuiz";

export async function generateStaticParams() {
  return getAllClientSlugs().map((slug) => ({ clientSlug: slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ clientSlug: string }> }) {
  const { clientSlug } = await params;
  const config = loadConfig(clientSlug);
  if (!config) return { title: "Not Found" };
  return {
    title: `${config.scorecardTitle} | ${config.clientName}`,
    description: config.scorecardDescription,
  };
}

export default async function ScorecardPage({ params }: { params: Promise<{ clientSlug: string }> }) {
  const { clientSlug } = await params;
  const config = loadConfig(clientSlug);
  if (!config) notFound();
  return <ScorecardQuiz config={config} />;
}

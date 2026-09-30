import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PortfolioProjectView } from "../../../components/Portfolio";
import { PORTFOLIO } from "../../../data";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return PORTFOLIO.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = PORTFOLIO.find((item) => item.slug === slug);
  if (!project) return {};
  return { title: `${project.name} · Portfolio · Lucas Ritter Dias`, description: project.summary.en };
}

export default async function PortfolioProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = PORTFOLIO.find((item) => item.slug === slug);
  if (!project) notFound();
  return <PortfolioProjectView project={project} locale="en" />;
}

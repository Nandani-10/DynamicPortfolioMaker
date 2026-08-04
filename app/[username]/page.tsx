import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPortfolioForPublicView } from "@/lib/firestore/portfolio-admin";
import { PortfolioView } from "@/components/portfolio/PortfolioView";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const portfolio = await getPortfolioForPublicView(username);

  if (!portfolio) {
    return { title: "Portfolio not found" };
  }

  const title = `${portfolio.hero.name} — ${portfolio.hero.roles[0] ?? "Portfolio"}`;
  const description = portfolio.hero.intro || portfolio.about.bio || undefined;
  const image = portfolio.hero.profileImage || portfolio.hero.bannerImage;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: image ? [image] : undefined,
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
    robots: portfolio.published ? undefined : { index: false, follow: false },
  };
}

export default async function PublicPortfolioPage({ params }: PageProps) {
  const { username } = await params;
  const portfolio = await getPortfolioForPublicView(username);

  if (!portfolio) {
    notFound();
  }

  return <PortfolioView portfolio={portfolio} />;
}

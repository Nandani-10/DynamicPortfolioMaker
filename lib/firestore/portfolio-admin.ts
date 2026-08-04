import "server-only";
import { cache } from "react";
import { getAdminDb } from "@/lib/firebase/admin";
import type { Portfolio } from "@/types/portfolio";

export const getPortfolioForPublicView = cache(async function getPortfolioForPublicView(
  username: string
): Promise<Portfolio | null> {
  const snap = await getAdminDb().collection("portfolios").doc(username).get();
  if (!snap.exists) return null;
  return snap.data() as Portfolio;
});

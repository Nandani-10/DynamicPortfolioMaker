"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { subscribeToPortfolio, updatePortfolio } from "@/lib/firestore/portfolio";
import type { Portfolio } from "@/types/portfolio";

interface UsePortfolioResult {
  portfolio: Portfolio | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  save: (data: Partial<Portfolio>) => Promise<void>;
}

export function useOwnerPortfolio(): UsePortfolioResult {
  const { profile } = useAuth();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile?.username) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = subscribeToPortfolio(profile.username, (data) => {
      setPortfolio(data);
      setLoading(false);
    });
    return unsubscribe;
  }, [profile?.username]);

  const save = async (data: Partial<Portfolio>) => {
    if (!profile?.username) return;
    setSaving(true);
    setError(null);
    try {
      await updatePortfolio(profile.username, data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save changes.");
      throw err;
    } finally {
      setSaving(false);
    }
  };

  return { portfolio, loading, saving, error, save };
}

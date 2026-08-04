import type { HeroContent } from "@/types/portfolio";

export function PortfolioFooter({ hero }: { hero: HeroContent }) {
  return (
    <footer className="border-t border-[var(--border)] px-6 py-10 text-center text-sm text-[var(--text-muted)]">
      <p>
        © {new Date().getFullYear()} {hero.name}. Crafted with Dynamic Portfolio Maker.
      </p>
    </footer>
  );
}

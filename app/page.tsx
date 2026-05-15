import { AutoCollageGenerator } from "./components/AutoCollageGenerator";
import { RandomFragmentChallenge } from "./components/RandomFragmentChallenge";
import { CollageHero } from "./components/CollageHero";
import { MyPortfolio } from "./components/MyPortfolio";
import { CommunityGallery } from "./components/CommunityGallery";

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col pl-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)] pb-[env(safe-area-inset-bottom,0px)]">
      <header className="relative z-20 flex items-center justify-between px-6 py-6 pt-[max(1.25rem,env(safe-area-inset-top,0px))] sm:px-10">
        <span className="font-display text-lg tracking-tight text-ink/90">
          Fragments
        </span>
        <nav
          className="font-body flex flex-wrap justify-end gap-x-8 gap-y-2 text-sm text-ink-soft [&_a]:touch-manipulation"
          aria-label="Primary"
        >
          <a
            href="#fragments"
            className="transition-colors duration-700 hover:text-ink"
          >
            fragments
          </a>
          <a
            href="#fragment-challenge"
            className="transition-colors duration-700 hover:text-ink"
          >
            challenge
          </a>
          <a
            href="#mood-collage-studio"
            className="transition-colors duration-700 hover:text-ink"
          >
            collage
          </a>
          <a
            href="#my-portfolio"
            className="transition-colors duration-700 hover:text-ink"
          >
            portfolio
          </a>
          <a
            href="#gallery-heading"
            className="transition-colors duration-700 hover:text-ink"
          >
            wall
          </a>
        </nav>
      </header>

      <main className="flex-1">
        <CollageHero />
        <RandomFragmentChallenge />
        <AutoCollageGenerator />
        <MyPortfolio />
        <CommunityGallery />
      </main>

      <footer className="relative z-20 border-t border-ink/10 px-6 py-12 text-center sm:px-10">
        <p className="font-body text-sm italic text-ink-soft">
          made for slow browsers and softer mornings · no rush to be finished
        </p>
      </footer>
    </div>
  );
}

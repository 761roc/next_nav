import { getTranslations, setRequestLocale } from "next-intl/server";
import { RetroSnakeGame } from "@/components/retro-snake-game";

export default async function GamePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const tGame = await getTranslations("game");

  return (
    <main className="page-wrap game-page-wrap">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <div className="hero-bg" aria-hidden="true" />
      <section id="main-content" className="content-shell game-page-shell">
        <RetroSnakeGame
          text={{
            backHref: `/${locale}`,
            backHome: tGame("backHome"),
            title: tGame("title"),
            subtitle: tGame("subtitle"),
            controls: tGame("controls"),
            hint: tGame("hint"),
            start: tGame("start"),
            restart: tGame("restart"),
            score: tGame("score"),
            best: tGame("best"),
            state: tGame("state"),
            pause: tGame("pause"),
            resume: tGame("resume"),
            up: tGame("up"),
            down: tGame("down"),
            left: tGame("left"),
            right: tGame("right"),
            stateMenu: tGame("stateMenu"),
            stateRunning: tGame("stateRunning"),
            statePaused: tGame("statePaused"),
            stateGameOver: tGame("stateGameOver"),
          }}
        />
      </section>
    </main>
  );
}

import { getTranslations, setRequestLocale } from "next-intl/server";
import { DouDizhuGame } from "@/components/dou-dizhu-game";

export default async function DouDizhuPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const tGame = await getTranslations("doudizhu");

  return (
    <main className="page-wrap game-page-wrap">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <div className="hero-bg" aria-hidden="true" />
      <section id="main-content" className="content-shell game-page-shell">
        <DouDizhuGame
          text={{
            backHref: `/${locale}`,
            backHome: tGame("backHome"),
            title: tGame("title"),
            subtitle: tGame("subtitle"),
            controls: tGame("controls"),
            hint: tGame("hint"),
            state: tGame("state"),
            status: tGame("state"),
            newRound: tGame("newRound"),
            play: tGame("play"),
            pass: tGame("pass"),
            clear: tGame("clear"),
            landlord: tGame("landlord"),
            farmer: tGame("farmer"),
            you: tGame("you"),
            leftBot: tGame("leftBot"),
            rightBot: tGame("rightBot"),
            bottomCards: tGame("bottomCards"),
            round: tGame("round"),
            turn: tGame("turn"),
            selected: tGame("selected"),
            table: tGame("table"),
            tableOpen: tGame("tableOpen"),
            thinking: tGame("thinking"),
            invalidCombo: tGame("invalidCombo"),
            mustBeat: tGame("mustBeat"),
            cannotPass: tGame("cannotPass"),
            winnerPlayer: tGame("winnerPlayer"),
            winnerLeft: tGame("winnerLeft"),
            winnerRight: tGame("winnerRight"),
            cardsLeft: tGame("cardsLeft"),
            statePlaying: tGame("statePlaying"),
            stateFinished: tGame("stateFinished"),
            publicArea: tGame("publicArea"),
            recentAction: tGame("recentAction"),
            actionPass: tGame("actionPass"),
            actionWaiting: tGame("actionWaiting"),
            soundOn: tGame("soundOn"),
            soundOff: tGame("soundOff"),
            callLandlord: tGame("callLandlord"),
            bidPass: tGame("bidPass"),
            bidOne: tGame("bidOne"),
            bidTwo: tGame("bidTwo"),
            bidThree: tGame("bidThree"),
            stateBidding: tGame("stateBidding"),
            bidLabel: tGame("bidLabel"),
          }}
        />
      </section>
    </main>
  );
}

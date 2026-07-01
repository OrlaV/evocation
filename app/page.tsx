import SectionRail from "@/components/SectionRail";
import Hero from "@/components/Hero";
import Ticker, { type TickerItem } from "@/components/Ticker";
import Registry from "@/components/Registry";
import Proof from "@/components/Proof";
import Process from "@/components/Process";
import Queue from "@/components/Queue";
import Guarantee from "@/components/Guarantee";
import { getPublishedProducts } from "@/lib/products";
import { optionRefs } from "@/lib/types";
import { getHomeStats } from "@/lib/stats";
import { getQueueBoard, getUserVoteKeys } from "@/lib/queue";
import { getUser } from "@/lib/customer-auth";

export default async function Home() {
  // reads the session (cookies) for the queue's auth state → dynamic render
  const [products, stats, board, user] = await Promise.all([
    getPublishedProducts(),
    getHomeStats(),
    getQueueBoard(),
    getUser(),
  ]);
  const votedKeys = user ? await getUserVoteKeys(user.id) : [];
  // refs the hero box recognises; a match funnels the visitor to /shop
  // (the real search), an unknown ref becomes a queue request. Built from the
  // FULL catalogue so any published part is recognised, not just the teasers.
  const searchRefs = products.flatMap((p) => optionRefs(p));

  // homepage registry is a teaser: only the 4 most recently CREATED parts
  // (by created_at, not last-edited), newest first. The shop shows them all.
  const latest = [...products]
    .sort(
      (a, b) =>
        new Date(b.created_at ?? 0).getTime() -
        new Date(a.created_at ?? 0).getTime(),
    )
    .slice(0, 4);

  // marquee on real data: revived parts (their primary ref) + the most-wanted
  // parts from the live queue. No hardcoded/stale references.
  const tickerItems: TickerItem[] = [
    ...latest.map((p): TickerItem => ({
      text: optionRefs(p)[0] ?? p.evo_no,
      status: "Revived",
    })),
    ...board.slice(0, 3).map((b): TickerItem => ({
      text: b.label,
      status: "In queue",
    })),
  ];

  return (
    <>
      <SectionRail />
      <main>
        <Hero searchRefs={searchRefs} stats={stats} />
        <Registry products={latest} />
        <Ticker items={tickerItems} />
        <Proof />
        <Process />
        <Queue board={board} isAuthed={!!user} votedKeys={votedKeys} />
        <Guarantee />
      </main>
    </>
  );
}

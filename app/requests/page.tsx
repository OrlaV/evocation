import { getQueueBoard } from "@/lib/queue";
import { getSettings } from "@/lib/settings";
import RequestsBoard from "@/components/RequestsBoard";
import Reveal from "@/components/Reveal";
import SectionNo from "@/components/SectionNo";
import { pageMeta } from "@/lib/site";

export const revalidate = 300;

export const metadata = pageMeta({
  title: "Most-wanted parts — the resurrection queue | Evocation",
  description:
    "The parts classic and youngtimer owners most want us to bring back next, ranked by demand. Check if yours is already requested — or add it to the queue.",
  path: "/requests",
});

export default async function RequestsPage() {
  const [board, settings] = await Promise.all([
    getQueueBoard(200),
    getSettings(),
  ]);

  return (
    <main className="relative overflow-hidden py-[clamp(56px,8vh,100px)]">
      <div className="wrap relative max-w-[820px]">
        <SectionNo>The resurrection queue</SectionNo>
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <h1 className="font-display max-w-[22ch] text-[clamp(1.9rem,3.8vw,2.9rem)] leading-[1.06] font-bold tracking-[-0.015em]">
              What owners want back{" "}
              <em className="text-brg not-italic">most.</em>
            </h1>
          </Reveal>
          <Reveal as="p" delay={0.1} className="max-w-[42ch] text-ink-soft">
            Ranked by how many owners have backed each part. Check yours
            isn&apos;t already here, then add your vote.
          </Reveal>
        </div>

        <RequestsBoard items={board} voteTarget={settings.queueVoteTarget} />

        <Reveal delay={0.1} className="mt-[clamp(24px,3vw,44px)]">
          <a
            href="/#queue"
            className="group flex flex-wrap items-center justify-between gap-3 border border-dashed border-ink-soft/50 px-5 py-4 transition-colors hover:border-brg"
          >
            <span className="text-[0.95rem] text-ink-soft">
              Don&apos;t see your part? Requests are how revivals start.
            </span>
            <span className="label-mono flex items-center gap-1.5 text-brg">
              Request or vote{" "}
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </span>
          </a>
        </Reveal>
      </div>
    </main>
  );
}

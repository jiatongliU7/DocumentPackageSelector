"use client";

import dynamic from "next/dynamic";

const HomeClient = dynamic(() => import("./home-client"), {
  ssr: false,
  loading: () => (
    <div className="min-h-full bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100" />
  ),
});

export default function PageShell() {
  return <HomeClient />;
}

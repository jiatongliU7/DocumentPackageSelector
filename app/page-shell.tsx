"use client";

import dynamic from "next/dynamic";

const HomeClient = dynamic(() => import("./home-client"), {
  ssr: false,
  loading: () => (
    <div
      className="min-h-full min-h-[40vh] bg-[#0d1117]"
      aria-hidden
    />
  ),
});

export default function PageShell() {
  return <HomeClient />;
}

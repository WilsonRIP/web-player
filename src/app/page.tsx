import type { Metadata } from "next";
import PageClient from "./page-client"; // Import the new client component

export const metadata: Metadata = {
  title: "Web Media Player",
  description: "A web-based media player for audio and video files",
};

export default function Home() {
  // This is now a Server Component.
  // It can fetch initial data if needed, but cannot use client-side hooks.

  return <PageClient />;
}

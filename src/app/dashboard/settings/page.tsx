import type { Metadata } from "next";
import { SettingsApp } from "@/modules/settings/components/settings-app";

export const metadata: Metadata = { title: "Paramètres" };

export default function SettingsPage() {
  return <SettingsApp />;
}

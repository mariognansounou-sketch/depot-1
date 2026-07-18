import type { Metadata } from "next";
import { ScriptGeneratorApp } from "@/modules/script-generator/components/script-generator-app";

export const metadata: Metadata = { title: "AI Script Generator" };

export default function ScriptGeneratorPage() {
  return <ScriptGeneratorApp />;
}

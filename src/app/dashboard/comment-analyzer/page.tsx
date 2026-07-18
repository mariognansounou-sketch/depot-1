import type { Metadata } from "next";
import { CommentAnalyzerApp } from "@/modules/comment-analyzer/components/comment-analyzer-app";

export const metadata: Metadata = { title: "AI Comment Analyzer" };

export default function CommentAnalyzerPage() {
  return <CommentAnalyzerApp />;
}

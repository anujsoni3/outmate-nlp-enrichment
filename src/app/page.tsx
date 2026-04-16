"use client";

import { useMemo, useState } from "react";
import { PromptForm } from "@/components/prompt-form";
import { SamplePrompts } from "@/components/sample-prompts";

type ApiSuccess = {
  results: unknown[];
  meta: {
    entityType: "company" | "prospect";
    resultCount: number;
    requestId: string;
  };
};

type ApiError = {
  message: string;
  errorCode: string;
  requestId: string;
};

const samples = [
  "Find 3 fast-growing SaaS companies in the US with 50-500 employees, raising Series B or later.",
  "Give me 3 VPs of Sales in European fintech startups with more than 100 employees.",
  "Top AI infrastructure companies hiring machine learning engineers in India.",
  "3 marketing leaders at e-commerce brands in North America doing more than $50M in revenue.",
  "Cybersecurity firms with increasing web traffic and at least 200 employees.",
];

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payload, setPayload] = useState<ApiSuccess | null>(null);

  const subtitle = useMemo(
    () =>
      payload
        ? `Last run: ${payload.meta.entityType} | ${payload.meta.resultCount} rows | request ${payload.meta.requestId}`
        : "Ready to enrich up to 3 records per search.",
    [payload],
  );

  async function handleSearch(): Promise<void> {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/enrich", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const body = (await response.json()) as ApiError;
        throw new Error(body.message || "Search failed. Please try again.");
      }

      const body = (await response.json()) as ApiSuccess;
      setPayload(body);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error.";
      setError(message);
      setPayload(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-emerald-50 px-4 py-10 text-slate-900 sm:px-6">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 rounded-3xl border border-slate-200 bg-white/85 p-6 shadow-xl backdrop-blur-sm sm:p-8">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">OutMate Demo</p>
          <h1 className="text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
            OutMate - NLP Enrichment Demo
          </h1>
          <p className="text-sm text-slate-600">
            Natural-language query to enriched B2B data. Strictly limited to 3 rows per request.
          </p>
        </header>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <PromptForm
            prompt={prompt}
            onPromptChange={setPrompt}
            onSubmit={() => {
              void handleSearch();
            }}
            loading={loading}
          />
          <div className="mt-5">
            <SamplePrompts prompts={samples} onSelectPrompt={setPrompt} />
          </div>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-700">Request status</p>
          <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
          {error ? (
            <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          ) : null}
          {!payload && !loading ? (
            <p className="mt-3 text-sm text-slate-500">
              No results yet. Run a prompt to fetch enriched records.
            </p>
          ) : null}
        </section>
      </main>
    </div>
  );
}

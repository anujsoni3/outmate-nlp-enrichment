type PromptFormProps = {
  prompt: string;
  onPromptChange: (value: string) => void;
  onSubmit: () => void;
  loading: boolean;
};

export function PromptForm({ prompt, onPromptChange, onSubmit, loading }: PromptFormProps) {
  return (
    <section className="space-y-3">
      <label htmlFor="prompt" className="text-sm font-medium text-slate-700">
        Describe your target dataset
      </label>
      <textarea
        id="prompt"
        rows={5}
        value={prompt}
        onChange={(event) => onPromptChange(event.target.value)}
        placeholder="Find 3 fast-growing SaaS companies in the US with 50-500 employees..."
        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none ring-sky-500 transition focus:ring-2"
      />
      <button
        type="button"
        disabled={loading}
        onClick={onSubmit}
        className="inline-flex items-center justify-center rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? "Enriching..." : "Search & Enrich"}
      </button>
    </section>
  );
}

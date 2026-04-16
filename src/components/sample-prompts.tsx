type SamplePromptsProps = {
  prompts: string[];
  onSelectPrompt: (prompt: string) => void;
};

export function SamplePrompts({ prompts, onSelectPrompt }: SamplePromptsProps) {
  return (
    <section className="space-y-3">
      <p className="text-sm font-medium text-slate-700">Example prompts</p>
      <div className="flex flex-wrap gap-2">
        {prompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onSelectPrompt(prompt)}
            className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 transition hover:border-sky-400 hover:bg-sky-50"
          >
            {prompt}
          </button>
        ))}
      </div>
    </section>
  );
}

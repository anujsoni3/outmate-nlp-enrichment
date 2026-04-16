type JsonModalProps = {
  title: string;
  data: unknown;
  onClose: () => void;
};

export function JsonModal({ title, data, onClose }: JsonModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-3xl rounded-2xl border border-slate-300 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <p className="text-sm font-semibold text-slate-800">{title}</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-600 transition hover:bg-slate-100"
          >
            Close
          </button>
        </div>
        <pre className="max-h-[60vh] overflow-auto bg-slate-950 p-4 text-xs leading-relaxed text-slate-100">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
}

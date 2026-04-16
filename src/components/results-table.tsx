import type { EnrichedRecord } from "@/lib/contracts";

type ResultsTableProps = {
  entityType: "company" | "prospect";
  results: EnrichedRecord[];
  onViewJson: (record: EnrichedRecord) => void;
};

export function ResultsTable({ entityType, results, onViewJson }: ResultsTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
          {entityType === "company" ? (
            <tr>
              <th className="px-3 py-3">Name</th>
              <th className="px-3 py-3">Domain</th>
              <th className="px-3 py-3">Industry</th>
              <th className="px-3 py-3">Employees</th>
              <th className="px-3 py-3">Revenue</th>
              <th className="px-3 py-3">Country</th>
              <th className="px-3 py-3">Website</th>
              <th className="px-3 py-3">LinkedIn</th>
              <th className="px-3 py-3">Debug</th>
            </tr>
          ) : (
            <tr>
              <th className="px-3 py-3">Name</th>
              <th className="px-3 py-3">Title</th>
              <th className="px-3 py-3">Company</th>
              <th className="px-3 py-3">Email</th>
              <th className="px-3 py-3">Country</th>
              <th className="px-3 py-3">LinkedIn</th>
              <th className="px-3 py-3">Debug</th>
            </tr>
          )}
        </thead>
        <tbody>
          {results.map((record) => {
            if (entityType === "company" && record.type === "company") {
              return (
                <tr key={record.id} className="border-t border-slate-200 bg-white">
                  <td className="px-3 py-3 font-medium text-slate-900">{record.name}</td>
                  <td className="px-3 py-3 text-slate-700">{record.domain ?? "-"}</td>
                  <td className="px-3 py-3 text-slate-700">{record.industry ?? "-"}</td>
                  <td className="px-3 py-3 text-slate-700">{record.employeeCount ?? "-"}</td>
                  <td className="px-3 py-3 text-slate-700">{record.revenue ?? "-"}</td>
                  <td className="px-3 py-3 text-slate-700">{record.country ?? "-"}</td>
                  <td className="px-3 py-3 text-slate-700">{record.website ?? "-"}</td>
                  <td className="px-3 py-3 text-slate-700">{record.linkedinUrl ?? "-"}</td>
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700 transition hover:bg-slate-100"
                      onClick={() => onViewJson(record)}
                    >
                      View JSON
                    </button>
                  </td>
                </tr>
              );
            }

            if (entityType === "prospect" && record.type === "prospect") {
              return (
                <tr key={record.id} className="border-t border-slate-200 bg-white">
                  <td className="px-3 py-3 font-medium text-slate-900">{record.name}</td>
                  <td className="px-3 py-3 text-slate-700">{record.title ?? "-"}</td>
                  <td className="px-3 py-3 text-slate-700">{record.company ?? "-"}</td>
                  <td className="px-3 py-3 text-slate-700">{record.email ?? "-"}</td>
                  <td className="px-3 py-3 text-slate-700">{record.country ?? "-"}</td>
                  <td className="px-3 py-3 text-slate-700">{record.linkedinUrl ?? "-"}</td>
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700 transition hover:bg-slate-100"
                      onClick={() => onViewJson(record)}
                    >
                      View JSON
                    </button>
                  </td>
                </tr>
              );
            }

            return null;
          })}
        </tbody>
      </table>
    </div>
  );
}

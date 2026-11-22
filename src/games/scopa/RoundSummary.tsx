import type { SideScore } from "./scopaRules";

interface RoundSummaryProps {
	summary: SideScore[];
	names: string[];
	totals: number[];
	target: number;
}

const ROWS: { key: keyof SideScore; label: string }[] = [
	{ key: "carte", label: "Carte" },
	{ key: "denari", label: "Denari" },
	{ key: "settebello", label: "Settebello" },
	{ key: "primiera", label: "Primiera" },
	{ key: "scope", label: "Scope" },
	{ key: "total", label: "Smazzata" },
];

/** Tabella dei punti della smazzata e del totale */
export function RoundSummary({
	summary,
	names,
	totals,
	target,
}: RoundSummaryProps) {
	return (
		<table className="rounded-xl bg-black/40 text-sm">
			<thead>
				<tr>
					<th className="px-3 py-1 text-left">Punti</th>
					{names.map((n) => (
						<th key={n} className="px-3 py-1">
							{n}
						</th>
					))}
				</tr>
			</thead>
			<tbody>
				{ROWS.map((row) => (
					<tr key={row.key} className={row.key === "total" ? "font-bold" : ""}>
						<td className="px-3 py-0.5">{row.label}</td>
						{summary.map((s, i) => (
							<td key={names[i]} className="px-3 py-0.5 text-center">
								{s[row.key]}
							</td>
						))}
					</tr>
				))}
				<tr className="border-t border-white/30 font-black text-yellow-300">
					<td className="px-3 py-1">Totale (a {target})</td>
					{totals.map((t, i) => (
						<td key={names[i]} className="px-3 py-1 text-center">
							{t}
						</td>
					))}
				</tr>
			</tbody>
		</table>
	);
}

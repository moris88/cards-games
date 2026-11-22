import { smorfia } from "./smorfia";

interface TabelloneProps {
	drawn: number[];
}

/** Tabellone 1-90 con i numeri estratti evidenziati */
export function Tabellone({ drawn }: TabelloneProps) {
	const last = drawn[drawn.length - 1];
	return (
		<div className="grid grid-cols-10 gap-0.5 rounded-lg bg-amber-900 p-1.5">
			{Array.from({ length: 90 }, (_, i) => i + 1).map((n) => {
				const out = drawn.includes(n);
				return (
					<div
						key={n}
						title={`${n} · ${smorfia(n).italiano}`}
						className={`flex h-6 w-6 items-center justify-center rounded text-[0.65rem] font-bold sm:h-7 sm:w-7 ${out ? "bg-red-600 text-white" : "bg-amber-50 text-slate-800"} ${n === last ? "animate-banner-pop ring-2 ring-yellow-300" : ""}`}
					>
						{n}
					</div>
				);
			})}
		</div>
	);
}

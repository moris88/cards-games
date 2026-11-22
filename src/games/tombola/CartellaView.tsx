import type { Cartella } from "./cartella";

interface CartellaViewProps {
	card: Cartella;
	/** Numeri da evidenziare come segnati */
	isMarked: (n: number) => boolean;
	onCell?: (n: number) => void;
	selected?: boolean;
	onSelect?: () => void;
	compact?: boolean;
}

/** Cartella della tombola: i numeri segnati hanno il fagiolo */
export function CartellaView({
	card,
	isMarked,
	onCell,
	selected,
	onSelect,
	compact,
}: CartellaViewProps) {
	const cell = compact
		? "h-5 w-5 text-[0.6rem]"
		: "h-7 w-7 text-xs sm:h-9 sm:w-9 sm:text-sm";
	// Le caselle vuote hanno un id dalla loro posizione fissa nella griglia
	const cells = card.flat().map((n, pos) => ({ n, id: n ?? `vuota-${pos}` }));
	const grid = (
		<div className="grid grid-cols-9 gap-0.5">
			{cells.map(({ n, id }) =>
				n === null ? (
					<div key={id} className={`${cell} rounded bg-amber-200/60`} />
				) : (
					<button
						key={n}
						type="button"
						disabled={!onCell}
						onClick={() => onCell?.(n)}
						className={`${cell} relative rounded bg-amber-50 font-bold text-slate-900 ${onCell ? "hover:bg-amber-100" : ""}`}
					>
						{n}
						{isMarked(n) && (
							<span className="absolute inset-0.5 animate-banner-pop rounded-full bg-amber-800/80" />
						)}
					</button>
				),
			)}
		</div>
	);

	if (!onSelect)
		return <div className="rounded-lg bg-red-800 p-1.5 shadow-lg">{grid}</div>;
	return (
		<button
			type="button"
			onClick={onSelect}
			className={`rounded-lg p-1.5 shadow-lg ${selected ? "bg-yellow-400 ring-4 ring-yellow-200" : "bg-red-800 hover:bg-red-700"}`}
		>
			{grid}
		</button>
	);
}

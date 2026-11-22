import { NeapolitanCardView } from "../../components/NeapolitanCardView";
import type { NeapolitanCard } from "../../core/deck";

interface CaptureChooserProps {
	choices: NeapolitanCard[][];
	onChoose: (take: NeapolitanCard[]) => void;
	onCancel: () => void;
}

/** Scelta della presa quando più combinazioni hanno la somma giusta */
export function CaptureChooser({
	choices,
	onChoose,
	onCancel,
}: CaptureChooserProps) {
	return (
		<div className="flex flex-wrap items-center justify-center gap-3 rounded-xl bg-black/40 p-3">
			<span className="font-semibold">Quale presa?</span>
			{choices.map((take) => (
				<button
					key={take.map((c) => c.id).join("+")}
					type="button"
					onClick={() => onChoose(take)}
					className="flex gap-1 rounded-lg bg-amber-500/20 p-1.5 ring-2 ring-amber-400 hover:bg-amber-500/40"
				>
					{take.map((c) => (
						<div key={c.id} className="pointer-events-none">
							<NeapolitanCardView card={{ ...c, id: `scelta-${c.id}` }} small />
						</div>
					))}
				</button>
			))}
			<button
				type="button"
				onClick={onCancel}
				className="rounded bg-slate-700 px-3 py-1 text-sm"
			>
				Annulla
			</button>
		</div>
	);
}

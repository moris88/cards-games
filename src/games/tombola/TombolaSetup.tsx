import { ActionButton } from "../../components/ActionButton";
import { CartellaView } from "./CartellaView";
import type { Cartella } from "./cartella";
import { CARD_COST, MAX_CARDS } from "./tombolaLogic";

interface TombolaSetupProps {
	offered: Cartella[];
	chosen: number[];
	chips: number;
	onToggle: (index: number) => void;
	onRegenerate: () => void;
	onStart: () => void;
}

/** Scelta delle cartelle da comprare (da 1 a 6) */
export function TombolaSetup({
	offered,
	chosen,
	chips,
	onToggle,
	onRegenerate,
	onStart,
}: TombolaSetupProps) {
	const cost = chosen.length * CARD_COST;
	const canAdd = (i: number) =>
		chosen.includes(i) ||
		(chosen.length < MAX_CARDS && cost + CARD_COST <= chips);

	return (
		<div className="flex flex-col items-center gap-4">
			<p className="rounded bg-black/30 px-4 py-1 text-lg">
				Scegli da 1 a {MAX_CARDS} cartelle · {chosen.length} scelte · costo{" "}
				{cost} fiches (ne hai {chips})
			</p>
			<div className="flex gap-2">
				<ActionButton onClick={onRegenerate}>Altre cartelle</ActionButton>
				<ActionButton onClick={onStart} disabled={chosen.length === 0}>
					Inizia l'estrazione
				</ActionButton>
			</div>
			<div className="flex flex-wrap justify-center gap-3">
				{offered.map((card, i) => (
					<CartellaView
						// biome-ignore lint/suspicious/noArrayIndexKey: l'offerta è rigenerata in blocco
						key={i}
						card={card}
						isMarked={() => false}
						selected={chosen.includes(i)}
						onSelect={canAdd(i) ? () => onToggle(i) : undefined}
					/>
				))}
			</div>
		</div>
	);
}

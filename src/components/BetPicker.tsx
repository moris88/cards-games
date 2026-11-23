import { useState } from "react";
import { ActionButton } from "./ActionButton";

const QUICK = [5, 10, 25, 50];

interface BetPickerProps {
	min: number;
	max: number;
	label: string;
	onConfirm: (amount: number) => void;
}

/** Scelta della puntata: fiches rapide e slider */
export function BetPicker({ min, max, label, onConfirm }: BetPickerProps) {
	const [amount, setAmount] = useState(Math.min(10, max));

	return (
		<div className="flex flex-wrap items-center justify-center gap-2 rounded-xl bg-black/30 p-3">
			{QUICK.filter((q) => q <= max).map((q) => (
				<button
					key={q}
					type="button"
					onClick={() => setAmount(q)}
					className={`h-11 w-11 rounded-full border-4 border-dashed font-bold shadow ${amount === q ? "border-yellow-300 bg-red-600" : "border-white bg-red-800"}`}
				>
					{q}
				</button>
			))}
			<button
				type="button"
				onClick={() => setAmount(Math.max(min, amount - 5))}
				disabled={amount <= min}
				className="rounded bg-slate-700 px-2 py-1 text-xs disabled:opacity-40"
				aria-label="Diminuisci la puntata"
			>
				−
			</button>
			<input
				type="range"
				min={min}
				max={max}
				step={5}
				value={amount}
				onChange={(e) => setAmount(Number(e.target.value))}
				aria-label="Puntata"
			/>
			<button
				type="button"
				onClick={() => setAmount(Math.min(max, amount + 5))}
				disabled={amount >= max}
				className="rounded bg-slate-700 px-2 py-1 text-xs disabled:opacity-40"
				aria-label="Aumenta la puntata"
			>
				+
			</button>
			<span className="w-12 text-center font-bold">{amount}</span>
			<ActionButton onClick={() => onConfirm(amount)}>{label}</ActionButton>
		</div>
	);
}

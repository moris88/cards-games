import { motion } from "framer-motion";

/** Tagli delle fiches, dal più alto: colore del bordo e del centro */
const DENOMINATIONS = [
	{
		value: 500,
		color: "bg-purple-700",
		edge: "border-purple-200",
		text: "text-white",
	},
	{
		value: 100,
		color: "bg-slate-900",
		edge: "border-slate-300",
		text: "text-white",
	},
	{
		value: 25,
		color: "bg-green-600",
		edge: "border-green-100",
		text: "text-white",
	},
	{ value: 5, color: "bg-red-600", edge: "border-red-100", text: "text-white" },
	{
		value: 1,
		color: "bg-slate-100",
		edge: "border-blue-500",
		text: "text-blue-800",
	},
];
const MAX_PER_PILE = 6;

/** Scompone un importo nei tagli delle fiches */
export function splitChips(amount: number) {
	let rest = amount;
	return DENOMINATIONS.map((d) => {
		const count = Math.floor(rest / d.value);
		rest -= count * d.value;
		return { ...d, count };
	}).filter((d) => d.count > 0);
}

interface ChipStackProps {
	amount: number;
	label?: string;
	small?: boolean;
	/** Id per animare lo spostamento delle fiches (es. dalla puntata al piatto) */
	layoutId?: string;
}

/** Pile di fiches colorate con l'importo */
export function ChipStack({ amount, label, small, layoutId }: ChipStackProps) {
	if (amount <= 0) return null;
	// Le fiches della pila si sovrappongono lasciando vedere il bordo di ognuna
	const size = small
		? "h-6 w-6 -mt-[1.1rem] border-2 text-[0.5rem]"
		: "h-8 w-8 -mt-6 border-[3px] text-[0.6rem]";

	return (
		<motion.div
			layoutId={layoutId}
			layout
			className="flex flex-col items-center gap-0.5"
			title={`${amount} fiches`}
		>
			<div className="flex items-end gap-0.5">
				{splitChips(amount).map((d) => {
					const pile = Math.min(d.count, MAX_PER_PILE);
					return (
						<div key={d.value} className="flex flex-col">
							{/* La prima fiche è quella in cima: sta sopra le altre e mostra il valore */}
							{Array.from({ length: pile }, (_, i) => (
								<motion.span
									// biome-ignore lint/suspicious/noArrayIndexKey: fiches identiche nella pila
									key={i}
									initial={{ y: -12, opacity: 0 }}
									animate={{ y: 0, opacity: 1 }}
									transition={{ delay: (pile - i) * 0.03 }}
									style={{ zIndex: pile - i }}
									className={`${size} ${d.color} ${d.edge} ${d.text} relative flex items-center justify-center rounded-full border-dashed font-black shadow-md first:mt-0`}
								>
									{i === 0 ? d.value : ""}
								</motion.span>
							))}
						</div>
					);
				})}
			</div>
			<span className="rounded bg-black/50 px-1.5 text-xs font-bold">
				{label ?? amount}
			</span>
		</motion.div>
	);
}

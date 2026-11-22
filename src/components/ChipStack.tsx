import { motion } from "framer-motion";

/** Tagli delle fiches, dal più alto: colore del bordo e del centro */
const DENOMINATIONS = [
	{ value: 500, color: "bg-purple-700", edge: "border-purple-200" },
	{ value: 100, color: "bg-slate-900", edge: "border-slate-300" },
	{ value: 25, color: "bg-green-600", edge: "border-green-100" },
	{ value: 5, color: "bg-red-600", edge: "border-red-100" },
	{ value: 1, color: "bg-slate-100", edge: "border-blue-500" },
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
	const size = small ? "h-4 w-4 border-2" : "h-6 w-6 border-[3px]";

	return (
		<motion.div
			layoutId={layoutId}
			layout
			className="flex flex-col items-center gap-0.5"
			title={`${amount} fiches`}
		>
			<div className="flex items-end gap-0.5">
				{splitChips(amount).map((d) => (
					<div key={d.value} className="flex flex-col-reverse">
						{Array.from({ length: Math.min(d.count, MAX_PER_PILE) }, (_, i) => (
							<motion.span
								// biome-ignore lint/suspicious/noArrayIndexKey: fiches identiche nella pila
								key={i}
								initial={{ y: -12, opacity: 0 }}
								animate={{ y: 0, opacity: 1 }}
								transition={{ delay: i * 0.03 }}
								className={`${size} ${d.color} ${d.edge} -mt-3 block rounded-full border-dashed shadow-md first:mt-0`}
							/>
						))}
					</div>
				))}
			</div>
			<span className="rounded bg-black/50 px-1.5 text-xs font-bold">
				{label ?? amount}
			</span>
		</motion.div>
	);
}

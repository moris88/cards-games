import { motion } from "framer-motion";
import { BIG_BLIND, SMALL_BLIND } from "./pokerLogic";

interface SeatBadgesProps {
	dealer: boolean;
	smallBlind: boolean;
	bigBlind: boolean;
}

/** Bottone del dealer e segnalini di small e big blind accanto al giocatore */
export function SeatBadges({ dealer, smallBlind, bigBlind }: SeatBadgesProps) {
	return (
		<div className="flex gap-1">
			{dealer && (
				<motion.span
					layoutId="dealer-button"
					title="Dealer (mazziere)"
					className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-slate-400 bg-white text-sm font-black text-slate-900 shadow-md"
				>
					D
				</motion.span>
			)}
			{smallBlind && (
				<motion.span
					layoutId="small-blind"
					title={`Small blind: ${SMALL_BLIND}`}
					className="flex h-7 items-center justify-center rounded-full bg-sky-500 px-2 text-xs font-bold shadow-md"
				>
					SB {SMALL_BLIND}
				</motion.span>
			)}
			{bigBlind && (
				<motion.span
					layoutId="big-blind"
					title={`Big blind: ${BIG_BLIND}`}
					className="flex h-7 items-center justify-center rounded-full bg-amber-500 px-2 text-xs font-bold text-slate-900 shadow-md"
				>
					BB {BIG_BLIND}
				</motion.span>
			)}
		</div>
	);
}

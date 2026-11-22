import { ChipStack } from "../../components/ChipStack";
import type { PokerPlayer, PokerState } from "./pokerLogic";
import { SeatBadges } from "./SeatBadges";

interface SeatInfoProps {
	state: PokerState;
	index: number;
}

/** Fiches del giocatore, puntata del giro e segnalini dealer / blind */
export function SeatInfo({ state, index }: SeatInfoProps) {
	const p: PokerPlayer = state.players[index];
	const status = p.out ? "eliminato" : p.folded ? "ha passato" : p.lastAction;

	return (
		<div className="flex flex-col items-center gap-1">
			<SeatBadges
				dealer={index === state.dealer}
				smallBlind={index === state.smallBlind && !p.out}
				bigBlind={index === state.bigBlind && !p.out}
			/>
			<div className="flex items-end gap-3">
				<div className="flex flex-col items-center text-xs">
					<ChipStack amount={p.chips} small />
					{p.chips === 0 && !p.out && <span>all-in</span>}
				</div>
				{p.bet > 0 && (
					<div className="flex flex-col items-center text-xs text-yellow-200">
						<ChipStack
							amount={p.bet}
							layoutId={`bet-${index}`}
							label={`puntata ${p.bet}`}
						/>
					</div>
				)}
			</div>
			{status && (
				<span className="text-xs italic text-emerald-100">{status}</span>
			)}
		</div>
	);
}

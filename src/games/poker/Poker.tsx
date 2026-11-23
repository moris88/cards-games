import { ActionButton } from "../../components/ActionButton";
import { ChipStack } from "../../components/ChipStack";
import { DeckPile } from "../../components/DeckPile";
import { EventOverlay } from "../../components/EventOverlay";
import { FrenchCardView } from "../../components/FrenchCardView";
import { GameOverDialog } from "../../components/GameOverDialog";
import { Hand } from "../../components/Hand";
import { Opponent } from "../../components/Opponent";
import { Table } from "../../components/Table";
import type { Difficulty } from "../../core/settings";
import { BetControls } from "./BetControls";
import { evaluateHand } from "./handEval";
import { BIG_BLIND, pot, SMALL_BLIND } from "./pokerLogic";
import { SeatInfo } from "./SeatInfo";
import { usePoker } from "./usePoker";

interface PokerProps {
	names: string[];
	difficulty: Difficulty;
	resume: boolean;
	onExit: () => void;
}

export function Poker({ names, difficulty, resume, onExit }: PokerProps) {
	const game = usePoker(names, difficulty, resume);
	const { state } = game;
	const human = state.players[0];
	const handOver = state.phase !== "gioco";
	// Nel piatto al centro vanno le puntate dei giri già chiusi
	const streetBets = state.players.reduce((s, p) => s + p.bet, 0);
	const handName =
		human.hole.length && state.board.length
			? evaluateHand([...human.hole, ...state.board]).name
			: "";

	return (
		<Table title="Poker Texas Hold'em" onExit={onExit}>
			<EventOverlay events={state.events} />
			<div className="flex flex-wrap justify-center gap-3">
				{state.players.slice(1).map((p, idx) => (
					<Opponent
						key={p.name}
						name={p.name}
						seed={idx + 1}
						active={!handOver && state.current === idx + 1}
						events={state.events}
					>
						<SeatInfo state={state} index={idx + 1} />
						<Hand
							cards={p.folded ? [] : p.hole}
							renderCard={(card) => (
								<FrenchCardView card={card} small faceDown={!state.showdown} />
							)}
						/>
					</Opponent>
				))}
			</div>

			<div className="flex flex-col items-center gap-2">
				<div className="flex items-center gap-4">
					<DeckPile
						deck="francesi"
						count={state.deck.length}
						topIds={state.deck.slice(-5).map((c) => c.id)}
						small
						label=""
					/>
					<div className="flex min-h-[calc(var(--card-w)*1.5)] w-[calc(var(--card-w)*5.6)] max-w-full justify-center gap-1 sm:gap-2 rounded-xl border-2 border-dashed border-emerald-300/40 p-2">
						{state.board.map((card) => (
							<FrenchCardView key={card.id} card={card} />
						))}
					</div>
				</div>
				<div className="flex items-center gap-4 rounded-full bg-black/40 px-5 py-2">
					<span className="font-bold">Piatto {pot(state)}</span>
					<ChipStack amount={pot(state) - streetBets} label="nel piatto" />
					<span className="text-xs text-emerald-100">
						Blind {SMALL_BLIND}/{BIG_BLIND}
					</span>
				</div>
				<p className="text-sm">{state.message}</p>
			</div>

			<div className="flex flex-col items-center gap-2">
				{game.isHumanTurn && (
					<BetControls
						me={human}
						currentBet={state.currentBet}
						minRaise={state.minRaise}
						pot={pot(state)}
						onAct={game.act}
					/>
				)}
				{state.phase === "fineMano" && (
					<ActionButton onClick={game.nextHand}>Prossima mano</ActionButton>
				)}
				{state.phase === "finePartita" && (
					<GameOverDialog
						won={!human.out}
						onRestart={game.restart}
						onExit={onExit}
					/>
				)}
				<div className="flex items-end gap-6">
					<Hand
						cards={human.hole}
						label={`${human.name} · fiches ${human.chips}${handName ? ` · ${handName}` : ""}`}
						renderCard={(card) => <FrenchCardView card={card} />}
					/>
					<SeatInfo state={state} index={0} />
				</div>
			</div>
		</Table>
	);
}

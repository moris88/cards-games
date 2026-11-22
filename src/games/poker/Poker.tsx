import { ActionButton } from "../../components/ActionButton";
import { DeckPile } from "../../components/DeckPile";
import { EventOverlay } from "../../components/EventOverlay";
import { FrenchCardView } from "../../components/FrenchCardView";
import { Hand } from "../../components/Hand";
import { Opponent } from "../../components/Opponent";
import { Table } from "../../components/Table";
import type { Difficulty } from "../../core/settings";
import { BetControls } from "./BetControls";
import { evaluateHand } from "./handEval";
import { type PokerPlayer, pot } from "./pokerLogic";
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

	const info = (p: PokerPlayer, i: number) => {
		const dealer = i === state.dealer ? "🔘 " : "";
		const status = p.out ? "eliminato" : p.folded ? "ha passato" : p.lastAction;
		const bet = p.bet > 0 ? ` · puntata ${p.bet}` : "";
		return `${dealer}fiches ${p.chips}${bet}${status ? ` · ${status}` : ""}`;
	};

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
						info={info(p, idx + 1)}
					>
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
					<div className="flex min-h-30 min-w-[27rem] gap-2 rounded-xl border-2 border-dashed border-emerald-300/40 p-2">
						{state.board.map((card) => (
							<FrenchCardView key={card.id} card={card} />
						))}
					</div>
				</div>
				<p className="rounded-full bg-black/40 px-5 py-1 text-lg font-bold">
					🪙 Piatto: {pot(state)}
				</p>
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
					<ActionButton onClick={game.restart}>Nuova partita</ActionButton>
				)}
				<Hand
					cards={human.hole}
					label={`${human.name} · ${info(human, 0)}${human.hole.length && state.board.length ? ` · ${evaluateHand([...human.hole, ...state.board]).name}` : ""}`}
					renderCard={(card) => <FrenchCardView card={card} />}
				/>
			</div>
		</Table>
	);
}

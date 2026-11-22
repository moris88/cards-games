import { ActionButton } from "../../components/ActionButton";
import { BetPicker } from "../../components/BetPicker";
import { DeckPile } from "../../components/DeckPile";
import { EventOverlay } from "../../components/EventOverlay";
import { Hand } from "../../components/Hand";
import { NeapolitanCardView } from "../../components/NeapolitanCardView";
import { Opponent } from "../../components/Opponent";
import { Table } from "../../components/Table";
import type { Difficulty } from "../../core/settings";
import {
	handScore,
	isReale,
	MIN_BET,
	type SevenPlayer,
} from "./setteEMezzoLogic";
import { useSetteEMezzo } from "./useSetteEMezzo";

const STATUS_LABELS: Record<SevenPlayer["status"], string> = {
	inGioco: "",
	stai: "· sta",
	sballato: "· sballato!",
	eliminato: "· eliminato",
};

/** Carte in cima al mazzo con animazione: bastano per la distribuzione a tutti */
const ANIMATED_TOP = 8;

interface SetteEMezzoProps {
	names: string[];
	difficulty: Difficulty;
	resume: boolean;
	onExit: () => void;
}

export function SetteEMezzo({
	names,
	difficulty,
	resume,
	onExit,
}: SetteEMezzoProps) {
	const game = useSetteEMezzo(names, difficulty, resume);
	const { state, activeIndex } = game;
	const reveal = state.phase === "fineMano" || state.phase === "finePartita";
	const human = state.players[0];
	const humanIsBanker = state.bankerIndex === 0;

	const describe = (p: SevenPlayer, i: number) => {
		const role = i === state.bankerIndex ? "🏦 mazziere · " : "";
		const bet = p.bet > 0 ? ` · puntata ${p.bet}` : "";
		// La prima carta delle CPU resta coperta fino a fine mano
		const score =
			(p.isHuman || reveal) && p.hand.length > 0
				? ` · punti ${handScore(p.hand)}`
				: "";
		const real = reveal && isReale(p.hand) ? " · REALE!" : "";
		const delta =
			reveal && p.lastDelta !== 0
				? ` · ${p.lastDelta > 0 ? "+" : ""}${p.lastDelta}`
				: "";
		return `${role}fiches ${p.chips}${bet}${score} ${STATUS_LABELS[p.status]}${real}${delta}`;
	};

	return (
		<Table title="Sette e mezzo" onExit={onExit}>
			<EventOverlay events={state.events} />
			<div className="flex flex-wrap justify-center gap-4">
				{state.players.slice(1).map((p, idx) => (
					<Opponent
						key={p.name}
						name={p.name}
						seed={idx + 1}
						active={activeIndex === idx + 1}
						events={state.events}
						info={describe(p, idx + 1)}
					>
						<Hand
							cards={p.hand}
							renderCard={(card) => (
								<NeapolitanCardView
									card={card}
									small
									faceDown={!reveal && card.id === p.hand[0]?.id}
								/>
							)}
						/>
					</Opponent>
				))}
			</div>

			<div className="flex flex-col items-center gap-3">
				<DeckPile
					deck="napoletane"
					count={state.deck.length + state.pile.length}
					topIds={[
						...state.deck.slice(-ANIMATED_TOP).map((c) => c.id),
						...state.pile.map((c) => c.id),
					]}
				/>
				{state.message && (
					<p className="rounded bg-black/30 px-4 py-1 text-lg">
						{state.message}
					</p>
				)}
				{state.phase === "puntate" &&
					(humanIsBanker ? (
						<ActionButton onClick={() => game.bet(0)}>
							Dai le carte
						</ActionButton>
					) : (
						<BetPicker
							min={MIN_BET}
							max={human.chips}
							label="Punta"
							onConfirm={game.bet}
						/>
					))}
				<div className="flex gap-3">
					{game.isHumanTurn && (
						<>
							<ActionButton onClick={game.draw}>Carta</ActionButton>
							<ActionButton onClick={game.stand}>Sto</ActionButton>
						</>
					)}
					{state.phase === "fineMano" && (
						<ActionButton onClick={game.nextRound}>Prossima mano</ActionButton>
					)}
					{state.phase === "finePartita" && (
						<ActionButton onClick={game.restart}>Nuova partita</ActionButton>
					)}
				</div>
			</div>

			<Hand
				cards={human.hand}
				label={`${human.name} · ${describe(human, 0)}`}
				renderCard={(card) => <NeapolitanCardView card={card} />}
			/>
		</Table>
	);
}

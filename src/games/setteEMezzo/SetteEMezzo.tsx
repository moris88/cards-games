import { ActionButton } from "../../components/ActionButton";
import { EventOverlay } from "../../components/EventOverlay";
import { Hand } from "../../components/Hand";
import { NeapolitanCardView } from "../../components/NeapolitanCardView";
import { Table } from "../../components/Table";
import { handScore, isReale, type SevenPlayer } from "./setteEMezzoLogic";
import { useSetteEMezzo } from "./useSetteEMezzo";

const STATUS_LABELS: Record<SevenPlayer["status"], string> = {
	inGioco: "",
	stai: "sta",
	sballato: "sballato!",
	eliminato: "eliminato",
};

interface SetteEMezzoProps {
	cpuCount: number;
	onExit: () => void;
}

export function SetteEMezzo({ cpuCount, onExit }: SetteEMezzoProps) {
	const game = useSetteEMezzo(cpuCount);
	const { state, activeIndex } = game;
	const reveal = state.phase !== "turni";

	const describe = (p: SevenPlayer, i: number) => {
		const role = i === state.bankerIndex ? " 🏦 mazziere" : "";
		const turn = i === activeIndex ? " ◀ di turno" : "";
		// La prima carta delle CPU resta coperta fino a fine mano
		const score = p.isHuman || reveal ? ` · punti ${handScore(p.hand)}` : "";
		const real = reveal && isReale(p.hand) ? " · REALE!" : "";
		const delta =
			reveal && p.lastDelta !== 0
				? ` · ${p.lastDelta > 0 ? "+" : ""}${p.lastDelta}`
				: "";
		return `${p.name}${role} · fiches ${p.chips}${score} ${STATUS_LABELS[p.status]}${real}${delta}${turn}`;
	};

	const human = state.players[0];

	return (
		<Table title="Sette e mezzo" onExit={onExit}>
			<EventOverlay events={state.events} />
			<div className="flex flex-wrap justify-center gap-6">
				{state.players.slice(1).map((p, idx) => (
					<Hand
						key={p.name}
						cards={p.hand}
						label={describe(p, idx + 1)}
						renderCard={(card) => (
							<NeapolitanCardView
								card={card}
								small
								faceDown={!reveal && card.id === p.hand[0]?.id}
							/>
						)}
					/>
				))}
			</div>

			<div className="flex flex-col items-center gap-3">
				<p className="rounded bg-black/30 px-4 py-1 text-lg">{state.message}</p>
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
				label={describe(human, 0)}
				renderCard={(card) => <NeapolitanCardView card={card} />}
			/>
		</Table>
	);
}

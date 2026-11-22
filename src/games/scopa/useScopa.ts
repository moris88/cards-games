import { useEffect, useState } from "react";
import type { NeapolitanCard } from "../../core/deck";
import type { Difficulty } from "../../core/settings";
import { useSavedGame } from "../../core/useSavedGame";
import { chooseMove } from "./scopaAi";
import {
	createGame,
	dealRound,
	playCard,
	resolvePlay,
	type ScopaState,
	type ScopaTarget,
} from "./scopaLogic";
import { captureOptions } from "./scopaRules";

const CPU_DELAY_MS = 900;
const CAPTURE_DELAY_MS = 1000;
const isFinished = (s: ScopaState) => s.phase === "finePartita";

export function useScopa(
	names: string[],
	target: ScopaTarget,
	difficulty: Difficulty,
	resume: boolean,
) {
	const [state, setState] = useSavedGame(
		"scopa",
		resume,
		() => createGame(names, target),
		isFinished,
	);
	/** Carta scelta dal giocatore quando ha più prese possibili */
	const [choosing, setChoosing] = useState<NeapolitanCard | null>(null);
	const current = state.players[state.current];

	useEffect(() => {
		if (state.phase === "presa") {
			const timer = setTimeout(() => setState(resolvePlay), CAPTURE_DELAY_MS);
			return () => clearTimeout(timer);
		}
		if (state.phase !== "gioco" || current.isHuman) return;
		const timer = setTimeout(() => {
			setState((s) => {
				const move = chooseMove(s, difficulty);
				return playCard(s, move.cardId, move.take);
			});
		}, CPU_DELAY_MS);
		return () => clearTimeout(timer);
	}, [state, current, difficulty, setState]);

	const canPlay = state.phase === "gioco" && current.isHuman;

	return {
		state,
		canPlay,
		choosing,
		choices: choosing ? captureOptions(state.table, choosing) : [],
		/** Clic su una carta della mano: con una sola presa possibile si gioca subito */
		play: (card: NeapolitanCard) => {
			const options = captureOptions(state.table, card);
			if (options.length > 1) {
				setChoosing(card);
				return;
			}
			setChoosing(null);
			setState((s) => playCard(s, card.id, options[0] ?? []));
		},
		chooseTake: (take: NeapolitanCard[]) => {
			if (!choosing) return;
			const card = choosing;
			setChoosing(null);
			setState((s) => playCard(s, card.id, take));
		},
		cancelChoice: () => setChoosing(null),
		nextRound: () => setState(dealRound),
		restart: () => setState(createGame(names, target)),
	};
}

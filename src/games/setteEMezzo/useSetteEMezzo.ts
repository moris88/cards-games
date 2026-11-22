import { useEffect } from "react";
import type { Difficulty } from "../../core/settings";
import { useSavedGame } from "../../core/useSavedGame";
import {
	collectCards,
	cpuWantsCard,
	createGame,
	currentPlayerIndex,
	drawCard,
	endTurn,
	placeBet,
	type SevenState,
	startRound,
} from "./setteEMezzoLogic";

const CPU_DELAY_MS = 900;
const COLLECT_MS = 700;
const isFinished = (s: SevenState) => s.phase === "finePartita";

export function useSetteEMezzo(
	names: string[],
	difficulty: Difficulty,
	resume: boolean,
) {
	const [state, setState] = useSavedGame(
		"setteEMezzo",
		resume,
		() => createGame(names, difficulty),
		isFinished,
	);
	const active =
		state.phase === "turni" ? state.players[currentPlayerIndex(state)] : null;

	// Turno automatico delle CPU e ritorno delle carte al mazzo
	useEffect(() => {
		if (state.phase === "raccolta") {
			const timer = setTimeout(
				() => setState((s) => startRound(s, difficulty)),
				COLLECT_MS,
			);
			return () => clearTimeout(timer);
		}
		if (!active || active.isHuman) return;
		const timer = setTimeout(() => {
			setState((s) =>
				cpuWantsCard(active.hand, s.deck, difficulty)
					? drawCard(s)
					: endTurn(s),
			);
		}, CPU_DELAY_MS);
		return () => clearTimeout(timer);
	}, [active, state.phase, difficulty, setState]);

	return {
		state,
		isHumanTurn: active?.isHuman ?? false,
		activeIndex: active ? currentPlayerIndex(state) : -1,
		bet: (amount: number) => setState((s) => placeBet(s, amount)),
		draw: () => setState(drawCard),
		stand: () => setState((s) => endTurn(s)),
		nextRound: () => setState(collectCards),
		restart: () => setState(createGame(names, difficulty)),
	};
}

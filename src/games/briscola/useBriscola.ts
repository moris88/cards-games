import { useEffect, useState } from "react";
import {
	type BriscolaState,
	cpuChoose,
	createGame,
	playCard,
	resolveTrick,
} from "./briscolaLogic";

const CPU_DELAY_MS = 800;
const TRICK_DELAY_MS = 1300;

export function useBriscola() {
	const [state, setState] = useState<BriscolaState>(createGame);

	useEffect(() => {
		let action: ((s: BriscolaState) => BriscolaState) | null = null;
		let delay = CPU_DELAY_MS;
		if (state.phase === "presa") {
			action = resolveTrick;
			delay = TRICK_DELAY_MS;
		} else if (state.phase === "gioco" && state.turn === 1) {
			action = (s) => playCard(s, cpuChoose(s));
		}
		if (!action) return;
		const run = action;
		const timer = setTimeout(() => setState(run), delay);
		return () => clearTimeout(timer);
	}, [state]);

	return {
		state,
		canPlay: state.phase === "gioco" && state.turn === 0,
		play: (cardId: string) => setState((s) => playCard(s, cardId)),
		restart: () => setState(createGame()),
	};
}

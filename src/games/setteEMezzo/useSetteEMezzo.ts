import { useEffect, useState } from "react";
import {
	cpuWantsCard,
	createGame,
	currentPlayerIndex,
	dealRound,
	drawCard,
	endTurn,
	type SevenState,
} from "./setteEMezzoLogic";

const CPU_DELAY_MS = 800;

export function useSetteEMezzo(cpuCount: number) {
	const [state, setState] = useState<SevenState>(() => createGame(cpuCount));
	const active =
		state.phase === "turni" ? state.players[currentPlayerIndex(state)] : null;
	const isHumanTurn = active?.isHuman ?? false;

	// Turno automatico delle CPU
	useEffect(() => {
		if (!active || active.isHuman) return;
		const timer = setTimeout(() => {
			setState((s) => (cpuWantsCard(active.hand) ? drawCard(s) : endTurn(s)));
		}, CPU_DELAY_MS);
		return () => clearTimeout(timer);
	}, [active]);

	return {
		state,
		isHumanTurn,
		activeIndex: active ? currentPlayerIndex(state) : -1,
		draw: () => setState(drawCard),
		stand: () => setState((s) => endTurn(s)),
		nextRound: () => setState(dealRound),
		restart: () => setState(createGame(cpuCount)),
	};
}

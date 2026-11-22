import { useCallback } from "react";
import { useSavedGame } from "../../core/useSavedGame";
import {
	createFreeCell,
	type FreeCellState,
	moveCards,
	quickMove,
	randomDeal,
	undo,
} from "./freecellLogic";
import type { Location } from "./solitaireRules";
import { useSolitaireTimer } from "./useSolitaireTimer";

const isFinished = (s: FreeCellState) => s.won;

export function useFreeCell(resume: boolean) {
	const [state, setState] = useSavedGame(
		"freecell",
		resume,
		() => createFreeCell(randomDeal()),
		isFinished,
	);

	const tick = useCallback(
		() => setState((s) => ({ ...s, elapsed: s.elapsed + 1 })),
		[setState],
	);
	useSolitaireTimer(state.moves > 0 && !state.won, tick);

	const apply = (fn: (s: FreeCellState) => FreeCellState | null) =>
		setState((s) => fn(s) ?? s);

	return {
		state,
		move: (from: Location, to: { kind: Location["kind"]; index: number }) =>
			apply((s) => moveCards(s, from, to)),
		quickMove: (from: Location) => apply((s) => quickMove(s, from)),
		undo: () => setState(undo),
		restart: () => setState((s) => createFreeCell(s.dealNumber)),
		newDeal: (dealNumber: number) => setState(createFreeCell(dealNumber)),
	};
}

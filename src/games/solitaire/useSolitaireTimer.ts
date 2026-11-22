import { useEffect } from "react";

/** Avanza il cronometro ogni secondo finché la partita è in corso */
export function useSolitaireTimer(running: boolean, tick: () => void): void {
	useEffect(() => {
		if (!running) return;
		const timer = setInterval(tick, 1000);
		return () => clearInterval(timer);
	}, [running, tick]);
}

import type { GameEvent } from "../core/gameEvents";
import { Confetti } from "./Confetti";
import { useEventQueue } from "./useEventQueue";

const TONE_STYLES: Record<GameEvent["tone"], string> = {
	win: "bg-gradient-to-br from-yellow-300 to-amber-500 text-amber-950 animate-banner-pop",
	lose: "bg-gradient-to-br from-red-500 to-red-800 text-white animate-banner-shake",
	info: "bg-slate-900/90 text-white animate-banner-pop",
};

interface EventOverlayProps {
	events: GameEvent[];
}

/** Banner animato sopra il tavolo, con coriandoli per le vittorie */
export function EventOverlay({ events }: EventOverlayProps) {
	const event = useEventQueue(events);
	if (!event) return null;

	return (
		<div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
			{event.tone === "win" && <Confetti key={event.id} />}
			<div
				key={event.id}
				className={`${TONE_STYLES[event.tone]} rounded-2xl border-4 border-white/70 px-10 py-5 text-center text-3xl font-black uppercase tracking-wide shadow-2xl sm:text-5xl`}
			>
				{event.text}
			</div>
		</div>
	);
}

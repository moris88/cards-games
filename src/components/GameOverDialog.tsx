import { ActionButton } from "./ActionButton";

interface GameOverDialogProps {
	won: boolean;
	onRestart: () => void;
	onExit: () => void;
}

/** Popup di fine partita: esito e scelta se ricominciare */
export function GameOverDialog({
	won,
	onRestart,
	onExit,
}: GameOverDialogProps) {
	return (
		<div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4">
			<div
				role="dialog"
				aria-modal="true"
				aria-labelledby="game-over-title"
				className="flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl border-4 border-amber-900 bg-felt-dark p-6 text-center shadow-2xl"
			>
				<h2 id="game-over-title" className="text-3xl font-black uppercase">
					Fine gioco
				</h2>
				<p className="text-2xl font-bold">
					{won ? "🏆 Hai vinto!" : "😞 Hai perso!"}
				</p>
				<p>Vuoi ricominciare la partita?</p>
				<div className="flex gap-3">
					<ActionButton onClick={onRestart}>Sì, ricomincia</ActionButton>
					<button
						type="button"
						onClick={onExit}
						className="rounded-lg bg-slate-700 px-4 py-2 font-semibold hover:bg-slate-600"
					>
						No, torna al menu
					</button>
				</div>
			</div>
		</div>
	);
}

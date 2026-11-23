import { useState } from "react";
import type { GameId, Settings } from "../core/settings";
import { hasSave } from "../core/useSavedGame";
import { OptionsDialog } from "./OptionsDialog";

export const MAX_CPU: Record<GameId, number> = {
	setteEMezzo: 3,
	briscola: 1,
	scala40: 3,
	tombola: 5,
	poker: 5,
	scopa: 3,
	scopone: 3,
	solitario: 0,
	freecell: 0,
	piramide: 0,
	orologio: 0,
};

const GAMES: { id: GameId; title: string; subtitle: string; icon: string }[] = [
	{
		id: "setteEMezzo",
		title: "Sette e mezzo",
		subtitle: "Carte napoletane",
		icon: "🎴",
	},
	{
		id: "briscola",
		title: "Briscola",
		subtitle: "Carte napoletane · 1 contro 1",
		icon: "🃏",
	},
	{ id: "scala40", title: "Scala 40", subtitle: "Carte francesi", icon: "♠️" },
	{
		id: "scopa",
		title: "Scopa",
		subtitle: "Carte napoletane · anche a coppie",
		icon: "🧹",
	},
	{
		id: "scopone",
		title: "Scopone",
		subtitle: "Tutte le carte in mano · 2 o 4 giocatori",
		icon: "🧹",
	},
	{
		id: "poker",
		title: "Poker Texas Hold'em",
		subtitle: "Carte francesi · No-Limit",
		icon: "🪙",
	},
	{
		id: "tombola",
		title: "Tombola",
		subtitle: "Con la smorfia napoletana",
		icon: "🎱",
	},
	{
		id: "solitario",
		title: "Solitario",
		subtitle: "Klondike · carte francesi",
		icon: "🂡",
	},
	{
		id: "freecell",
		title: "FreeCell",
		subtitle: "Partite numerate · carte francesi",
		icon: "🗃️",
	},
	{
		id: "piramide",
		title: "Piramide",
		subtitle: "Coppie che fanno 10 · carte napoletane",
		icon: "🔺",
	},
	{
		id: "orologio",
		title: "L'Orologio",
		subtitle: "Solitario tradizionale · carte napoletane",
		icon: "🕰️",
	},
];

/** Modalità di gioco mostrata sulla scheda: da solo o contro avversari */
function modeLabel(id: GameId, cpuCount: number): string {
	const opponents = Math.min(cpuCount, MAX_CPU[id]);
	if (opponents === 0) return "👤 Da solo";
	if (id === "scopone")
		return opponents >= 2
			? "👥 A coppie, 2 contro 2"
			: "👥 Contro 1 avversario";
	if (id === "scopa" && opponents === 3) return "👥 A coppie, 2 contro 2";
	return `👥 Contro ${opponents} ${opponents === 1 ? "avversario" : "avversari"}`;
}

interface MainMenuProps {
	settings: Settings;
	onSettings: (settings: Settings) => void;
	onPlay: (game: GameId, resume: boolean) => void;
}

export function MainMenu({ settings, onSettings, onPlay }: MainMenuProps) {
	const [options, setOptions] = useState(false);

	return (
		<div className="flex min-h-screen flex-col items-center justify-center gap-8 p-6">
			<h1 className="text-4xl font-bold">🃏 Giochi di carte</h1>
			<p className="-mt-4 text-sm text-emerald-100">
				di{" "}
				<a
					href="https://www.mauriziotolomeo.it"
					target="_blank"
					rel="noopener noreferrer"
					className="underline hover:text-white"
				>
					Maurizio Tolomeo
				</a>
			</p>
			<div className="flex flex-wrap items-center justify-center gap-4">
				<span className="text-emerald-100">
					{settings.playerName || "Tu"} contro {settings.cpuCount} avversari
				</span>
				<button
					type="button"
					onClick={() => setOptions(true)}
					className="rounded-lg bg-slate-700 px-4 py-2 hover:bg-slate-600"
				>
					⚙️ Opzioni e regole
				</button>
			</div>
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{GAMES.map((g) => (
					<div
						key={g.id}
						className="flex flex-col gap-3 rounded-2xl border-4 border-amber-900 bg-felt p-5 shadow-lg"
					>
						<div>
							<div className="text-2xl font-bold">
								{g.icon} {g.title}
							</div>
							<div className="text-emerald-200">{g.subtitle}</div>
							<div className="mt-1 flex flex-wrap gap-1 text-xs">
								<span className="rounded-full bg-black/40 px-2 py-0.5 font-semibold">
									{modeLabel(g.id, settings.cpuCount)}
								</span>
								{MAX_CPU[g.id] > 0 && (
									<span className="rounded-full bg-black/30 px-2 py-0.5 capitalize">
										{settings.difficulty[g.id]}
									</span>
								)}
								{g.id === "solitario" && (
									<span className="rounded-full bg-black/30 px-2 py-0.5">
										gira {settings.klondikeDraw}
									</span>
								)}
							</div>
						</div>
						<div className="flex gap-2">
							<button
								type="button"
								onClick={() => onPlay(g.id, false)}
								className="rounded-lg bg-amber-500 px-3 py-1.5 font-semibold text-slate-900 hover:bg-amber-400"
							>
								Nuova partita
							</button>
							{hasSave(g.id) && (
								<button
									type="button"
									onClick={() => onPlay(g.id, true)}
									className="rounded-lg bg-emerald-600 px-3 py-1.5 font-semibold hover:bg-emerald-500"
								>
									Riprendi
								</button>
							)}
						</div>
					</div>
				))}
			</div>
			{options && (
				<OptionsDialog
					settings={settings}
					onChange={onSettings}
					onClose={() => setOptions(false)}
				/>
			)}
		</div>
	);
}

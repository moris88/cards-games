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
	solitario: 0,
	freecell: 0,
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
];

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
							<div className="text-emerald-200">
								{g.subtitle}
								{MAX_CPU[g.id] > 0
									? ` · ${Math.min(settings.cpuCount, MAX_CPU[g.id])} CPU · ${settings.difficulty[g.id]}`
									: g.id === "solitario"
										? ` · gira ${settings.klondikeDraw}`
										: ""}
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

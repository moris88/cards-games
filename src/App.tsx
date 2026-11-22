import { useState } from "react";
import { Briscola } from "./games/briscola/Briscola";
import { Scala40 } from "./games/scala40/Scala40";
import { SetteEMezzo } from "./games/setteEMezzo/SetteEMezzo";

type GameId = "setteEMezzo" | "briscola" | "scala40";

const GAMES: { id: GameId; title: string; subtitle: string }[] = [
	{
		id: "setteEMezzo",
		title: "Sette e mezzo",
		subtitle: "Carte napoletane · 1-3 CPU",
	},
	{
		id: "briscola",
		title: "Briscola",
		subtitle: "Carte napoletane · 1 contro 1",
	},
	{ id: "scala40", title: "Scala 40", subtitle: "Carte francesi · 1-3 CPU" },
];

export default function App() {
	const [game, setGame] = useState<GameId | null>(null);
	const [cpuCount, setCpuCount] = useState(1);
	const exit = () => setGame(null);

	if (game === "setteEMezzo")
		return <SetteEMezzo cpuCount={cpuCount} onExit={exit} />;
	if (game === "briscola") return <Briscola onExit={exit} />;
	if (game === "scala40") return <Scala40 cpuCount={cpuCount} onExit={exit} />;

	return (
		<div className="flex min-h-screen flex-col items-center justify-center gap-8 p-6">
			<h1 className="text-4xl font-bold">🃏 Giochi di carte</h1>
			<label className="flex items-center gap-2">
				Avversari CPU (7½ e Scala 40):
				<select
					value={cpuCount}
					onChange={(e) => setCpuCount(Number(e.target.value))}
					className="rounded bg-slate-800 px-2 py-1"
				>
					{[1, 2, 3].map((n) => (
						<option key={n} value={n}>
							{n}
						</option>
					))}
				</select>
			</label>
			<div className="grid gap-4 sm:grid-cols-3">
				{GAMES.map((g) => (
					<button
						key={g.id}
						type="button"
						onClick={() => setGame(g.id)}
						className="rounded-2xl border-4 border-amber-900 bg-felt p-6 text-left shadow-lg hover:scale-105 hover:bg-emerald-800"
					>
						<div className="text-2xl font-bold">{g.title}</div>
						<div className="text-emerald-200">{g.subtitle}</div>
					</button>
				))}
			</div>
		</div>
	);
}

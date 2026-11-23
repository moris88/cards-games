import { LayoutGroup } from "framer-motion";
import { useState } from "react";
import {
	type GameId,
	loadSettings,
	normalizeSettings,
	playerNames,
	type Settings,
	saveSettings,
} from "./core/settings";
import { Briscola } from "./games/briscola/Briscola";
import { ClockSolitaire } from "./games/napoletaneSolitaire/ClockSolitaire";
import { Pyramid } from "./games/napoletaneSolitaire/Pyramid";
import { Poker } from "./games/poker/Poker";
import { Scala40 } from "./games/scala40/Scala40";
import { Scopa } from "./games/scopa/Scopa";
import { SetteEMezzo } from "./games/setteEMezzo/SetteEMezzo";
import { FreeCell } from "./games/solitaire/FreeCell";
import { Klondike } from "./games/solitaire/Klondike";
import { Tombola } from "./games/tombola/Tombola";
import { MAX_CPU, MainMenu } from "./menu/MainMenu";

interface Session {
	game: GameId;
	resume: boolean;
}

export default function App() {
	const [storedSettings, setSettings] = useState<Settings>(loadSettings);
	const [session, setSession] = useState<Session | null>(null);
	// Sempre completate: evita valori mancanti da impostazioni di versioni precedenti
	const settings = normalizeSettings(storedSettings);

	const updateSettings = (next: Settings) => {
		const normalized = normalizeSettings(next);
		setSettings(normalized);
		saveSettings(normalized);
	};

	if (!session)
		return (
			<MainMenu
				settings={settings}
				onSettings={updateSettings}
				onPlay={(game, resume) => setSession({ game, resume })}
			/>
		);

	const { game, resume } = session;
	// Lo Scopone si gioca solo in 2 o in 4
	const opponents =
		game === "scopone"
			? settings.cpuCount >= 2
				? 3
				: 1
			: Math.min(settings.cpuCount, MAX_CPU[game]);
	const props = {
		names: playerNames(settings, opponents),
		difficulty: settings.difficulty[game],
		resume,
		onExit: () => setSession(null),
	};

	return (
		<LayoutGroup>
			{game === "setteEMezzo" && (
				<SetteEMezzo {...props} swapFour={settings.setteSwapFour} />
			)}
			{game === "briscola" && <Briscola {...props} />}
			{game === "scala40" && <Scala40 {...props} />}
			{game === "tombola" && <Tombola {...props} />}
			{game === "poker" && <Poker {...props} />}
			{game === "scopa" && (
				<Scopa {...props} target={settings.scopaTarget} variant="scopa" />
			)}
			{game === "scopone" && (
				<Scopa {...props} target={settings.scopaTarget} variant="scopone" />
			)}
			{game === "solitario" && (
				<Klondike
					drawCount={settings.klondikeDraw}
					resume={resume}
					onExit={props.onExit}
				/>
			)}
			{game === "piramide" && <Pyramid resume={resume} onExit={props.onExit} />}
			{game === "orologio" && (
				<ClockSolitaire resume={resume} onExit={props.onExit} />
			)}
			{game === "freecell" && (
				<FreeCell resume={resume} onExit={props.onExit} />
			)}
		</LayoutGroup>
	);
}

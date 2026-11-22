import type { ReactNode } from "react";
import { type GameEvent, moodOf } from "../core/gameEvents";
import { Avatar } from "./Avatar";

interface OpponentProps {
	name: string;
	seed: number;
	active: boolean;
	events: GameEvent[];
	info?: string;
	children?: ReactNode;
}

/** Avversario al tavolo: volto, informazioni e carte */
export function Opponent({
	name,
	seed,
	active,
	events,
	info,
	children,
}: OpponentProps) {
	return (
		<div
			className={`flex flex-col items-center gap-1 rounded-2xl p-2 transition-colors ${active ? "bg-yellow-300/15 ring-2 ring-yellow-300/70" : ""}`}
		>
			<div className="flex items-center gap-2">
				<Avatar name={name} seed={seed} mood={moodOf(name, events, active)} />
				<div className="text-sm">
					<div className="font-bold">{name}</div>
					{info && <div className="text-emerald-100">{info}</div>}
				</div>
			</div>
			{children}
		</div>
	);
}

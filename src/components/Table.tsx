import type { ReactNode } from "react";

interface TableProps {
	title: string;
	onExit: () => void;
	children: ReactNode;
}

/** Tavolo da gioco con panno verde */
export function Table({ title, onExit, children }: TableProps) {
	return (
		<div className="flex min-h-dvh flex-col">
			<header className="flex items-center justify-between gap-2 bg-felt-dark px-3 py-1.5 shadow sm:px-4 sm:py-2">
				<h1 className="truncate text-base font-bold sm:text-xl">{title}</h1>
				<button
					type="button"
					onClick={onExit}
					className="shrink-0 rounded bg-slate-700 px-3 py-1 text-sm hover:bg-slate-600"
				>
					← Menu
				</button>
			</header>
			<main className="m-1 flex flex-1 flex-col justify-between gap-2 overflow-x-hidden rounded-2xl border-4 border-amber-900 bg-felt bg-[radial-gradient(circle,#198754_0%,#0f5132_70%)] p-2 shadow-inner sm:m-4 sm:gap-4 sm:rounded-[3rem] sm:border-8 sm:p-4">
				{children}
			</main>
		</div>
	);
}

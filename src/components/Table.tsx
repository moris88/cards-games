import type { ReactNode } from "react";

interface TableProps {
	title: string;
	onExit: () => void;
	children: ReactNode;
}

/** Tavolo da gioco con panno verde */
export function Table({ title, onExit, children }: TableProps) {
	return (
		<div className="flex min-h-screen flex-col">
			<header className="flex items-center justify-between bg-felt-dark px-4 py-2 shadow">
				<h1 className="text-xl font-bold">{title}</h1>
				<button
					type="button"
					onClick={onExit}
					className="rounded bg-slate-700 px-3 py-1 text-sm hover:bg-slate-600"
				>
					← Menu
				</button>
			</header>
			<main className="m-2 flex flex-1 flex-col justify-between gap-4 rounded-[3rem] border-8 border-amber-900 bg-felt bg-[radial-gradient(circle,#198754_0%,#0f5132_70%)] p-4 shadow-inner sm:m-4">
				{children}
			</main>
		</div>
	);
}

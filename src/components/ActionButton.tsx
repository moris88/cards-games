import type { ReactNode } from "react";

interface ActionButtonProps {
	children: ReactNode;
	onClick: () => void;
	disabled?: boolean;
}

export function ActionButton({
	children,
	onClick,
	disabled,
}: ActionButtonProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			className="rounded-lg bg-amber-500 px-4 py-2 font-semibold text-slate-900 shadow hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-40"
		>
			{children}
		</button>
	);
}

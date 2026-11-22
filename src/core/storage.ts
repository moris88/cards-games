const PREFIX = "cards-games:";

/** Legge un valore da localStorage; null se assente, corrotto o non accessibile */
export function loadJson<T>(key: string): T | null {
	try {
		const raw = localStorage.getItem(PREFIX + key);
		// JSON.parse restituisce any: il dato è stato scritto da saveJson con lo stesso tipo
		return raw ? (JSON.parse(raw) as T) : null;
	} catch {
		return null;
	}
}

export function saveJson(key: string, value: unknown): void {
	try {
		localStorage.setItem(PREFIX + key, JSON.stringify(value));
	} catch {
		// Storage pieno o bloccato: il salvataggio è solo una comodità
	}
}

export function removeJson(key: string): void {
	try {
		localStorage.removeItem(PREFIX + key);
	} catch {
		// Ignorato: storage non accessibile
	}
}

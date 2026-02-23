/**
 * Format date to local string
 */
export function formatDate(date: string | Date | undefined | null): string {
	if (!date) return "-";

	const d = typeof date === "string" ? new Date(date) : date;

	return new Intl.DateTimeFormat("id-ID", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	}).format(d);
}

/**
 * Format date with time
 */
export function formatDateTime(date: string | Date | undefined | null): string {
	if (!date) return "-";

	const d = typeof date === "string" ? new Date(date) : date;

	return new Intl.DateTimeFormat("id-ID", {
		day: "2-digit",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	}).format(d);
}

/**
 * Get relative time (e.g., "2 hari lalu")
 */
export function getRelativeTime(date: string | Date | undefined | null): string {
	if (!date) return "-";

	const d = typeof date === "string" ? new Date(date) : date;
	const now = new Date();
	const diffInMs = now.getTime() - d.getTime();
	const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
	const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
	const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

	if (diffInMinutes < 1) return "Baru saja";
	if (diffInMinutes < 60) return `${diffInMinutes} menit lalu`;
	if (diffInHours < 24) return `${diffInHours} jam lalu`;
	if (diffInDays < 7) return `${diffInDays} hari lalu`;

	return formatDate(d);
}

/**
 * Check if date is within last N days
 */
export function isWithinDays(date: string | Date | undefined | null, days: number): boolean {
	if (!date) return false;

	const d = typeof date === "string" ? new Date(date) : date;
	const now = new Date();
	const diffInMs = now.getTime() - d.getTime();
	const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

	return diffInDays <= days;
}

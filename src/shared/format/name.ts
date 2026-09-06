export function initialsOf(name: string) {
	return name
		.trim()
		.split(/\s+/)
		.map((word) => word.charAt(0).toUpperCase())
		.filter(Boolean)
		.slice(0, 2)
		.join("");
}

import { initialsOf } from "../format/name";

type AvatarProps = {
	name: string;
	size?: "sm" | "md";
};

const SIZES = {
	sm: "h-[30px] w-[30px] text-[12px]",
	md: "h-[44px] w-[44px] text-[15px]",
} as const;

export function Avatar({ name, size = "sm" }: AvatarProps) {
	return (
		<div
			className={`flex shrink-0 items-center justify-center rounded-full bg-brand-soft font-semibold text-brand-ink ${SIZES[size]}`}
		>
			{initialsOf(name)}
		</div>
	);
}

import { createFileRoute } from "@tanstack/react-router";
import { DayPanel } from "#/features/appointments/components/DayPanel";

export const Route = createFileRoute("/_app/")({ component: DayPanel });

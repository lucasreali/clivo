import { createFileRoute } from "@tanstack/react-router";
import { WeekAgenda } from "#/features/appointments/components/WeekAgenda";

export const Route = createFileRoute("/_app/agenda")({ component: WeekAgenda });

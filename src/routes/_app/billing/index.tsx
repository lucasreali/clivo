import { createFileRoute } from "@tanstack/react-router";
import { BillingReport } from "#/features/billing/components/BillingReport";

export const Route = createFileRoute("/_app/billing/")({
	component: BillingReport,
});

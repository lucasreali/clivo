import { createFileRoute } from "@tanstack/react-router";
import { InvoiceDetail } from "#/features/billing/components/InvoiceDetail";

export const Route = createFileRoute("/_app/financeiro/$invoiceId")({
	component: InvoicePage,
});

function InvoicePage() {
	const { invoiceId } = Route.useParams();
	return <InvoiceDetail invoiceId={Number(invoiceId)} />;
}

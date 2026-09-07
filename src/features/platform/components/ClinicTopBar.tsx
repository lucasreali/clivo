import { useGetClinic } from "#/api/gen/hooks";
import { TopBar } from "#/features/navigation/components/TopBar";
import { shortDate } from "#/shared/format/date";
import { taxId } from "#/shared/format/document";
import { describeClinicStatus } from "../model/clinic-status";

type ClinicTopBarProps = {
	tenantId: string;
	section: string;
	meta?: string;
	actions?: React.ReactNode;
};

export function ClinicTopBar({
	tenantId,
	section,
	meta,
	actions,
}: ClinicTopBarProps) {
	const clinic = useGetClinic({ path: { tenantId } });
	const situation = describeClinicStatus(clinic.data?.status);

	const details = [
		clinic.data?.taxId ? taxId(clinic.data.taxId) : undefined,
		`${situation.label} desde ${shortDate(clinic.data?.createdAt)}`,
		meta,
	].filter(Boolean);

	return (
		<TopBar
			title={`${clinic.data?.name ?? "Clínica"} · ${section}`}
			meta={details.join(" · ")}
			actions={actions}
		/>
	);
}

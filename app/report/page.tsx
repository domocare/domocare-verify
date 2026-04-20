import ReportForm from "./report-form";

export default async function ReportPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return <ReportForm token={token || ""} />;
}

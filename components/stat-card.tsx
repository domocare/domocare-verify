type Props = {
  title: string;
  value: number | string;
  subtitle?: string;
};

export default function StatCard({ title, value, subtitle }: Props) {
  return (
    <div className="rounded-2xl bg-white shadow-sm p-5 border">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="text-3xl font-semibold mt-2">{value}</p>
      {subtitle ? <p className="text-xs text-slate-400 mt-2">{subtitle}</p> : null}
    </div>
  );
}
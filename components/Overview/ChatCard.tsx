const ChartCard: React.FC<{
  title: string;
  children: React.ReactNode;
  fullWidth?: boolean;
}> = ({ title, children, fullWidth }) => (
  <div
    className={`bg-white/80 backdrop-blur-sm rounded-lg shadow p-5 ${fullWidth ? 'col-span-full' : ''}`}
  >
    <h2 className="text-lg font-medium pl-2">{title}</h2>
    <div className="pt-8 h-60">{children}</div>
  </div>
);

export default ChartCard;

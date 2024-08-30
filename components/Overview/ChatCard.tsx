import { Loader } from '@/components/ui/spinner';

const ChartCard: React.FC<{
  title: string;
  children: React.ReactNode;
  fullWidth?: boolean;
  isLoading?: boolean;
}> = ({ title, children, fullWidth, isLoading }) => (
  <div
    className={`bg-white/80 backdrop-blur-sm rounded-lg shadow p-5 ${fullWidth ? 'col-span-full' : ''}`}
  >
    <h2 className="text-lg font-medium pl-2">{title}</h2>
    <div className="pt-8 h-60">
      {isLoading ? <Loader className="w-24 h-24 border-amber-500" /> : children}
    </div>
  </div>
);

export default ChartCard;

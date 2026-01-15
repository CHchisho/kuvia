import {cn} from '@/utils/cn';

const Divider = ({
  variant = 'medium',
  className,
}: {
  variant?: 'medium' | 'small';
  className?: string;
}) => {
  return (
    <div
      className={cn(
        variant === 'medium' ? 'h-16 gap-2 md:gap-4' : 'h-6 gap-2',
        'w-full flex px-12 justify-center',
        className
      )}
    >
      {Array.from({length: variant === 'medium' ? 93 : 47}).map((_, index) => (
        <div key={index} className="min-w-px h-full bg-mono-400"></div>
      ))}
    </div>
  );
};

export default Divider;

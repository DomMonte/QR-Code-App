import { cn } from '@/lib/Helpers';

export const Background = (props: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cn('w-full bg-secondary', props.className)}>
    {props.children}
  </div>
);

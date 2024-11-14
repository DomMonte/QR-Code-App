import { AppConfig } from '@/utils/AppConfig';

export const Logo = (props: {
  isTextHidden?: boolean;
}) => (
  <div className="flex items-center text-xl font-semibold">
    <img 
      src="/logo.png" 
      alt="SnapShare QR Logo" 
      className="mr-2 h-8 w-auto object-contain"
    />
    {!props.isTextHidden && AppConfig.name}
  </div>
);

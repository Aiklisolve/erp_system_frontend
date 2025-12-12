import { ERPLoader } from './ERPLoader';

type LoadingStateProps = {
  label?: string;
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal';
};

export function LoadingState({ 
  label = 'Loading data...',
  fullScreen = false,
  size = 'md',
  variant = 'minimal'
}: LoadingStateProps) {
  return (
    <ERPLoader 
      label={label}
      fullScreen={fullScreen}
      size={size}
      variant={variant}
    />
  );
}



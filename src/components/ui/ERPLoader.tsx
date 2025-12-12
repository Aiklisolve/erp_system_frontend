import { appConfig } from '../../config/appConfig';

type ERPLoaderProps = {
  label?: string;
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal';
};

export function ERPLoader({ 
  label = 'Loading data...', 
  fullScreen = false,
  size = 'md',
  variant = 'default'
}: ERPLoaderProps) {
  const sizeClasses = {
    sm: {
      spinner: 'w-6 h-6',
      text: 'text-xs',
      gap: 'gap-2',
      container: 'p-4'
    },
    md: {
      spinner: 'w-10 h-10 sm:w-12 sm:h-12',
      text: 'text-sm sm:text-base',
      gap: 'gap-3 sm:gap-4',
      container: 'p-6 sm:p-8'
    },
    lg: {
      spinner: 'w-16 h-16 sm:w-20 sm:h-20',
      text: 'text-base sm:text-lg',
      gap: 'gap-4 sm:gap-5',
      container: 'p-8 sm:p-12'
    }
  };

  const classes = sizeClasses[size];

  if (variant === 'minimal') {
    return (
      <div className={`flex items-center justify-center ${fullScreen ? 'min-h-screen' : 'py-8'} ${classes.container}`}>
        <div className={`flex flex-col items-center ${classes.gap}`}>
          <div className={`${classes.spinner} relative`}>
            <div className="absolute inset-0 border-4 border-teal-100 rounded-full"></div>
            <div className={`absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin`}></div>
          </div>
          {label && (
            <p className={`${classes.text} text-slate-600 font-medium animate-pulse`}>
              {label}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center ${fullScreen ? 'min-h-screen bg-gradient-to-br from-slate-50 to-teal-50' : 'py-8 sm:py-12'} ${classes.container}`}>
      <div className={`flex flex-col items-center ${classes.gap} max-w-md w-full px-4`}>
        {/* ERP Branded Spinner */}
        <div className="relative">
          {/* Outer rotating ring */}
          <div className={`${classes.spinner} relative`}>
            <div className="absolute inset-0 border-4 border-teal-100 rounded-full"></div>
            <div className={`absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin`} style={{ animationDuration: '1s' }}></div>
          </div>
          
          {/* Inner pulsing circle */}
          <div className={`absolute inset-0 flex items-center justify-center`}>
            <div className={`${size === 'lg' ? 'w-8 h-8 sm:w-10 sm:h-10' : size === 'md' ? 'w-6 h-6 sm:w-8 sm:h-8' : 'w-4 h-4'} bg-gradient-to-br from-primary to-teal-600 rounded-full animate-pulse`}></div>
          </div>
          
          {/* Orbiting dots */}
          <div className={`absolute inset-0 ${classes.spinner}`}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className={`${size === 'lg' ? 'w-2 h-2 sm:w-3 sm:h-3' : size === 'md' ? 'w-1.5 h-1.5 sm:w-2 sm:h-2' : 'w-1 h-1'} bg-primary rounded-full animate-ping`} style={{ animationDelay: '0s', animationDuration: '1.5s' }}></div>
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
              <div className={`${size === 'lg' ? 'w-2 h-2 sm:w-3 sm:h-3' : size === 'md' ? 'w-1.5 h-1.5 sm:w-2 sm:h-2' : 'w-1 h-1'} bg-teal-500 rounded-full animate-ping`} style={{ animationDelay: '0.5s', animationDuration: '1.5s' }}></div>
            </div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2">
              <div className={`${size === 'lg' ? 'w-2 h-2 sm:w-3 sm:h-3' : size === 'md' ? 'w-1.5 h-1.5 sm:w-2 sm:h-2' : 'w-1 h-1'} bg-teal-400 rounded-full animate-ping`} style={{ animationDelay: '1s', animationDuration: '1.5s' }}></div>
            </div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2">
              <div className={`${size === 'lg' ? 'w-2 h-2 sm:w-3 sm:h-3' : size === 'md' ? 'w-1.5 h-1.5 sm:w-2 sm:h-2' : 'w-1 h-1'} bg-primary-light rounded-full animate-ping`} style={{ animationDelay: '1.5s', animationDuration: '1.5s' }}></div>
            </div>
          </div>
        </div>

        {/* Loading Text */}
        {label && (
          <div className="text-center space-y-2">
            <p className={`${classes.text} text-slate-700 font-semibold`}>
              {label}
            </p>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              {appConfig.brandName} ERP System
            </p>
          </div>
        )}

        {/* Progress Dots */}
        <div className="flex items-center gap-1.5 sm:gap-2 mt-2">
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '1.4s' }}></div>
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s', animationDuration: '1.4s' }}></div>
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s', animationDuration: '1.4s' }}></div>
        </div>
      </div>
    </div>
  );
}

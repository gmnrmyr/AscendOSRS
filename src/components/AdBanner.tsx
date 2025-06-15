
interface AdBannerProps {
  className?: string;
  size?: 'banner' | 'square' | 'skyscraper';
}

export function AdBanner({ className = '', size = 'banner' }: AdBannerProps) {
  const dimensions = {
    banner: 'h-24 w-full max-w-4xl', // 728x90 leaderboard
    square: 'h-64 w-64', // 250x250 square
    skyscraper: 'h-96 w-40', // 160x600 skyscraper
  };

  return (
    <div className={`pixel-card ${dimensions[size]} ${className}`}>
      <div className="h-full w-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-gray-800 font-bold text-lg mb-2 font-mono">Advertisement</div>
          <div className="text-gray-600 text-sm font-mono">
            {size === 'banner' && '728 x 90'}
            {size === 'square' && '250 x 250'}
            {size === 'skyscraper' && '160 x 600'}
          </div>
          <div className="text-gray-500 text-xs mt-1 font-mono">Google AdSense</div>
        </div>
      </div>
    </div>
  );
}

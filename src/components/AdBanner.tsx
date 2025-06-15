
import { Card } from "@/components/ui/card";

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
    <Card className={`osrs-card border-dashed border-amber-300 ${dimensions[size]} ${className}`}>
      <div className="h-full w-full flex items-center justify-center bg-amber-50">
        <div className="text-center">
          <div className="text-amber-600 font-bold text-lg mb-2">Advertisement</div>
          <div className="text-amber-500 text-sm">
            {size === 'banner' && '728 x 90'}
            {size === 'square' && '250 x 250'}
            {size === 'skyscraper' && '160 x 600'}
          </div>
          <div className="text-amber-500 text-xs mt-1">Google AdSense</div>
        </div>
      </div>
    </Card>
  );
}

import { HexColorPicker } from 'react-colorful';
import { Sun, Moon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { hexToHsl, hslToHex } from '@/utils/color';

interface ColorThemeCardProps {
  color: string;
  setColor: (color: string) => void;
  radius: number;
  setRadius: (radius: number) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

const ColorThemeCard = ({
  color,
  setColor,
  radius,
  setRadius,
  theme,
  setTheme,
}: ColorThemeCardProps) => {
  const radiusOptions = [
    { value: 0, label: '0' },
    { value: 0.3, label: '0.3' },
    { value: 0.5, label: '0.5' },
    { value: 0.75, label: '0.75' },
    { value: 1.0, label: '1.0' },
  ];
  const colorHex = hslToHex(color);

  const handleRadiusChange = (value: number) => {
    setRadius(value);
  };

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
  };
  return (
    <div className="rounded-md border p-5">
      <div className="flex gap-4">
        <div className="space-y-4">
          <div>
            <h3 className="mb-2 font-medium">Pick a color</h3>
            <HexColorPicker
              color={colorHex}
              onChange={(c) => {
                try {
                  setColor(hexToHsl(c));
                } catch {
                  // Do nothing
                }
              }}
              className="w-full max-w-[300px]"
            />
          </div>
        </div>
        <div className="space-y-5">
          <div>
            <h3 className="mb-2 font-medium">Radius</h3>
            <div className="flex flex-wrap gap-2">
              {radiusOptions.map((option) => (
                <Badge
                  key={option.value}
                  variant={radius === option.value ? 'default' : 'outline'}
                  onClick={() => handleRadiusChange(option.value)}
                  className="hover:bg-primary/90 cursor-pointer rounded-full py-1 hover:text-white"
                >
                  {option.label}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-2 font-medium">Mode</h3>
            <div className="flex gap-2">
              <Badge
                variant={theme === 'light' ? 'default' : 'outline'}
                onClick={() => handleThemeChange('light')}
                className="hover:bg-primary/90 flex cursor-pointer items-center gap-2 rounded-full py-1 hover:text-white"
              >
                <Sun className="h-4 w-4" />
                Light
              </Badge>
              <Badge
                variant={theme === 'dark' ? 'default' : 'outline'}
                onClick={() => handleThemeChange('dark')}
                className="hover:bg-primary/90 flex cursor-pointer items-center gap-2 rounded-full py-1 hover:text-white"
              >
                <Moon className="h-4 w-4" />
                Dark
              </Badge>
            </div>
          </div>
          <div>
            <h3 className="mb-2 font-medium">Or enter a Hex value</h3>
            <Input
              value={colorHex}
              onChange={(e) => setColor(hexToHsl(e.target.value))}
              placeholder="e.g. #84D455"
              className="w-full max-w-[300px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorThemeCard;

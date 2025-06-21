import { fontPairs } from '@/constants/fonts';
import './font.css';
interface TypographyCardProps {
  headingFont: string;
  bodyFont: string;
  onChangeTypography: (headingFont: string, bodyFont: string, links: string[]) => void;
}

const TypographyCard = ({ headingFont, bodyFont, onChangeTypography }: TypographyCardProps) => {
  const isSelected = (pairHeadingFont: string, pairBodyFont: string) => {
    return headingFont === pairHeadingFont && bodyFont === pairBodyFont;
  };

  return (
    <div className="flex-1 overflow-auto rounded-md border p-5">
      <h2 className="text-foreground mb-4 text-xl font-semibold">Typography</h2>
      <div className="space-y-2">
        {fontPairs.map((pair, index) => (
          <div
            key={index}
            onClick={() => onChangeTypography(pair.heading, pair.body, pair.links)}
            className={`cursor-pointer rounded-md border p-2 transition-colors ${
              isSelected(pair.heading, pair.body)
                ? 'border-primary'
                : 'hover:border-primary border-transparent'
            }`}
          >
            <div className="text-card-foreground rounded-lg">
              <div
                style={{
                  fontFamily: pair.heading,
                }}
                className={`text-foreground mb-2 font-semibold`}
              >
                {pair.heading} as a font pair for your product as sample text
              </div>
              <p
                style={{
                  fontFamily: pair.body,
                }}
                className={`text-muted-foreground text-sm`}
              >
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatibus excepturi a
                qui consequuntur aspernatur soluta et tempore quaerat, facilis totam quod deleniti
                veniam quas tenetur? Iusto ipsum fugiat distinctio atque.
              </p>
              <h3
                style={{
                  fontFamily: pair.heading,
                }}
                className="text-primary mt-2 font-medium underline underline-offset-2"
              >
                {pair.heading} & {pair.body}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TypographyCard;

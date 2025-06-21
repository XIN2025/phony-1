import { Button } from '@/components/ui/button';
import {
  DialogTitle,
  DialogContent,
  DialogHeader,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Dialog } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import React from 'react';
import { ThemeDesign } from '@/types/design';
import { Check, Copy, FileText, Palette, Type } from 'lucide-react';
import { toast } from 'sonner';

type Props = {
  themeDesign: ThemeDesign;
};

const CopyThemeDialog = ({ themeDesign }: Props) => {
  const [copied, setCopied] = React.useState<string | null>(null);

  const generateCSSVariables = () => {
    const lightVars = Object.entries(themeDesign.colors.light)
      .map(([key, value]) => `  ${key}: ${value};`)
      .join('\n');
    const darkVars = Object.entries(themeDesign.colors.dark)
      .map(([key, value]) => `  ${key}: ${value};`)
      .join('\n');

    return `:root {\n${lightVars}\n}\n\n.dark {\n${darkVars}\n}`;
  };

  const copyToClipboard = async (text: string, type: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(null), 2000);
  };

  const CodeBlock = ({ code, type }: { code: string; type: string }) => (
    <div className="group relative">
      <pre className="bg-muted/50 relative mt-2 overflow-x-auto rounded-lg p-4 break-all whitespace-pre-wrap">
        <code className="font-mono text-sm">{code}</code>
      </pre>
      <Button
        size="sm"
        variant="ghost"
        className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100"
        onClick={() => copyToClipboard(code, type)}
      >
        {copied === type ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">Copy Code</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Copy Theme Code</DialogTitle>
          <DialogDescription>
            Copy the CSS variables or typography code for your theme
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="css" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="css" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              CSS Variables
            </TabsTrigger>
            <TabsTrigger value="typography" className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              Typography
            </TabsTrigger>
          </TabsList>
          <ScrollArea className="mt-4 h-[500px] rounded-md border p-4">
            <TabsContent value="css">
              <div className="space-y-4">
                <div>
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <FileText className="h-4 w-4" />
                    CSS Variables
                  </h3>
                  <CodeBlock code={generateCSSVariables()} type="css" />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="typography">
              <div className="space-y-6">
                <div>
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <Type className="h-4 w-4" />
                    Font Imports
                  </h3>
                  {themeDesign.typography.fontLinks.map((link, index) => (
                    <CodeBlock
                      key={index}
                      code={`@import url('${link}');`}
                      type={`typography-${index}`}
                    />
                  ))}
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-medium">Font Setup</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-muted-foreground mb-2 text-sm">Global Font Setup</p>
                      <CodeBlock
                        code={`/* Global font setup */
body {
  font-family: '${themeDesign.typography.body}', sans-serif;
}

h1, h2, h3, h4, h5, h6 {
  font-family: '${themeDesign.typography.heading}', sans-serif;
}`}
                        type="global-font-setup"
                      />
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-2 text-sm">Utility Classes</p>
                      <CodeBlock
                        code={`/* Utility classes for specific use cases */
.font-heading {
  font-family: '${themeDesign.typography.heading}', sans-serif;
}

.font-body {
  font-family: '${themeDesign.typography.body}', sans-serif;
}`}
                        type="utility-classes"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CopyThemeDialog;

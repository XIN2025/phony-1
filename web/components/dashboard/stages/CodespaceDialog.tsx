import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { ArrowRight, Code2, FileText, Github, Loader, MessageSquare, Zap } from 'lucide-react';
import { toast } from 'sonner';

const codespaceSchema = z.object({
  url: z
    .string()
    .url('Please enter a valid URL')
    .refine(
      (url) => {
        if (!url) return false;
        const urlObject = new URL(url);
        return urlObject.hostname.endsWith('.github.dev');
      },
      {
        message: 'URL must end with .github.dev',
      },
    ),
});

type CodespaceFormValues = z.infer<typeof codespaceSchema>;

interface CodespaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (url: string) => Promise<void>;
  repoUrl: string;
}

export function CodespaceDialog({ open, onOpenChange, onSubmit, repoUrl }: CodespaceDialogProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [canPaste, setCanPaste] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CodespaceFormValues>({
    resolver: zodResolver(codespaceSchema),
    defaultValues: {
      url: '',
    },
  });

  useEffect(() => {
    setCanPaste('clipboard' in navigator);
  }, []);

  const handleSubmit = async (data: CodespaceFormValues) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data.url);
      onOpenChange(false);
    } catch {
      toast.error('Failed to connect CodeSpace');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Setup GitHub CodeSpace</DialogTitle>
          <DialogDescription className="text-muted-foreground text-base">
            Let&apos;s get your development environment ready
          </DialogDescription>
        </DialogHeader>

        <div className="relative py-6">
          <div className="bg-muted absolute top-0 left-0 h-1 w-full rounded-full">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-500 ease-in-out"
              style={{ width: `${(activeStep + 1) * 50}%` }}
            />
          </div>

          <div className="mt-6">
            {activeStep === 0 ? (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/20">
                    <Code2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium">Create Your CodeSpace</h3>
                  <p className="text-muted-foreground mt-2 text-sm">
                    We&apos;ll open GitHub in a new tab to set up your development environment
                  </p>
                </div>

                <div className="bg-sidebar overflow-hidden rounded-lg border">
                  <div className="p-4">
                    <div className="flex items-center gap-3">
                      <Github className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium">github.com</span>
                    </div>
                    <div className="text-muted-foreground mt-3 text-sm">
                      You&apos;ll be redirected to GitHub to create your CodeSpace
                    </div>
                  </div>
                  <div className="bg-sidebar space-y-3 border-t p-4">
                    <Button
                      variant="default"
                      onClick={() => {
                        const codespaceUrl = repoUrl
                          .replace(
                            'https://github.com/',
                            'https://github.com/codespaces/new?hide_repo_select=true&repo=',
                          )
                          .replace(/\/$/, '');
                        window.open(codespaceUrl, '_blank');
                        setActiveStep(1);
                      }}
                      className="w-full"
                    >
                      Create CodeSpace
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      onClick={() => setActiveStep(1)}
                      className="text-muted-foreground hover:text-foreground w-full"
                    >
                      I already have a CodeSpace URL
                      <FileText className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/20">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium">Connect Your CodeSpace</h3>
                  <p className="text-muted-foreground mt-2 text-sm">
                    Copy your CodeSpace URL from GitHub and paste it below
                  </p>
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                    <div className="overflow-hidden">
                      <div className="space-y-4 p-4">
                        <FormField
                          control={form.control}
                          name="url"
                          render={({ field }) => (
                            <FormItem>
                              <div className="relative">
                                <FormControl>
                                  <Input
                                    placeholder="something.github.dev"
                                    className="pr-20"
                                    {...field}
                                  />
                                </FormControl>
                                {canPaste && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={async () => {
                                      try {
                                        const text = await navigator.clipboard.readText();
                                        form.setValue('url', text);
                                        form.trigger('url');
                                      } catch {
                                        toast.error('Failed to paste from clipboard');
                                      }
                                    }}
                                    className="absolute top-1/2 right-2 h-7 -translate-y-1/2 px-2 text-xs font-medium text-blue-500 hover:bg-blue-50 hover:text-blue-800"
                                  >
                                    Paste URL
                                  </Button>
                                )}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex items-center gap-2 rounded-lg bg-blue-500/10 p-3 text-sm text-blue-500">
                          <div className="rounded-full p-1">
                            <MessageSquare className="h-4 w-4" />
                          </div>
                          <span>The URL should end with &quot;.github.dev&quot;</span>
                        </div>
                      </div>

                      <div className="bg-card border-t p-4">
                        <Button
                          type="submit"
                          variant="default"
                          disabled={isSubmitting || !form.formState.isValid}
                          className="w-full"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader className="mr-2 h-4 w-4 animate-spin" />
                              Setting up...
                            </>
                          ) : (
                            <>
                              Connect and Continue
                              <Zap className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </form>
                </Form>

                <Button
                  variant="ghost"
                  onClick={() => setActiveStep(0)}
                  className="mx-auto flex items-center gap-2 text-sm"
                >
                  <ArrowRight className="h-4 w-4 rotate-180" />
                  Go back
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

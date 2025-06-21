import { SecretVersion } from '@/types/secrets';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { CopyIcon, Edit2Icon, CheckIcon, EyeOffIcon, EyeIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';

interface SecretEditorProps {
  currentSecrets: SecretVersion | null;
  isEditing: boolean;
  editedSecrets: string;
  isLoading: boolean;
  onEditStart: () => void;
  onEditCancel: () => void;
  onEditedSecretsChange: (value: string) => void;
  onSaveSecrets: () => void;
  environment: string;
  isSaving?: boolean;
}

export function SecretEditor({
  currentSecrets,
  isEditing,
  editedSecrets,
  isLoading,
  onEditStart,
  onEditCancel,
  onEditedSecretsChange,
  onSaveSecrets,
  environment,
  isSaving = false,
}: SecretEditorProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => setIsCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  const handleCopySecrets = () => {
    if (currentSecrets?.secrets) {
      navigator.clipboard.writeText(currentSecrets.secrets);
      setIsCopied(true);
      toast.success('Secrets copied to clipboard');
    }
  };

  const renderSecrets = (secrets: string) => {
    return secrets.split('\n').map((line, index) => {
      const [key, ...value] = line.split('=').map((part) => part.trim());
      const hasValue = line.includes('=');

      return (
        <div key={index} className="flex">
          <span className="text-muted-foreground w-8 pr-4 text-right select-none">{index + 1}</span>
          <span className="flex-1">
            {hasValue ? (
              <>
                <span className="text-amber-600 dark:text-amber-500">{key}</span>=
                <span
                  className={`ml-1 transition-all duration-200 ${
                    !showSecrets && value
                      ? 'blur-xs select-none hover:blur-none hover:select-text'
                      : ''
                  }`}
                >
                  {value.join('=') || '\u00A0'}
                </span>
              </>
            ) : (
              line || '\u00A0'
            )}
          </span>
        </div>
      );
    });
  };

  if (isLoading) {
    return (
      <Card className="border-border bg-background border">
        <CardContent className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-9" />
              <Skeleton className="h-9 w-9" />
            </div>
          </div>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-primary flex items-center gap-2 text-sm font-medium">
          {environment?.toUpperCase() || 'ENVIRONMENT'}
        </span>
        {currentSecrets && (
          <div className="flex items-center gap-2">
            {currentSecrets && (
              <Badge
                variant="default"
                className="bg-green-500/10 text-xs text-green-500 hover:bg-green-500/20"
              >
                Version {currentSecrets.versionNumber}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSecrets(!showSecrets)}
              disabled={!currentSecrets.secrets}
              className="relative"
            >
              {showSecrets ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopySecrets}
              disabled={!currentSecrets.secrets}
            >
              {isCopied ? (
                <CheckIcon className="h-4 w-4 text-emerald-500" />
              ) : (
                <CopyIcon className="h-4 w-4" />
              )}
            </Button>
            <Button variant="ghost" size="icon" onClick={onEditStart}>
              <Edit2Icon className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      {isEditing ? (
        <div className="space-y-4">
          <Textarea
            value={editedSecrets}
            onChange={(e) => onEditedSecretsChange(e.target.value)}
            className="bg-sidebar resize-y border-2 font-mono text-sm"
            placeholder="Enter your secrets here..."
            rows={20}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onEditCancel} disabled={isSaving}>
              Cancel
            </Button>
            <Button className="gap-2" onClick={onSaveSecrets} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-sidebar space-y-1 overflow-x-auto rounded-lg border-2 p-4 font-mono text-sm">
          {currentSecrets?.secrets ? (
            renderSecrets(currentSecrets.secrets)
          ) : (
            <span className="text-muted-foreground">No secrets defined</span>
          )}
        </div>
      )}
    </div>
  );
}

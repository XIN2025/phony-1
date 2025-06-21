import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Github, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useGithub } from '@/hooks/useGithub';

const GITHUB_CLIENT_ID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
const GITHUB_REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/github`;

export default function GithubSettings() {
  const { githubStatus, isLoading, error } = useGithub();

  const handleGitHubConnect = () => {
    const scope = 'repo codespace workflow';
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${GITHUB_REDIRECT_URI}&scope=${scope}`;
  };

  return (
    <Card className="border-none bg-transparent shadow-none">
      <CardHeader className="max-sm:px-2">
        <div className="flex items-center space-x-2">
          <Github className="text-primary h-5 w-5" />
          <h3 className="text-lg font-semibold">Github Integration</h3>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 max-sm:p-2">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[100px]" />
            </div>
          </div>
        ) : githubStatus ? (
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={githubStatus.avatar_url} alt={githubStatus.username} />
              <AvatarFallback>{githubStatus.username[0]}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="font-medium">{githubStatus.name}</p>
              <p className="text-muted-foreground text-sm">{githubStatus.email}</p>
              <div className="flex items-center text-sm text-green-600">
                <CheckCircle2 className="mr-1 h-4 w-4" />
                Connected
              </div>
            </div>
          </div>
        ) : (
          <Button onClick={handleGitHubConnect} className="w-full sm:w-auto" size="lg">
            <Github className="mr-2 h-5 w-5" />
            Connect GitHub Account
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

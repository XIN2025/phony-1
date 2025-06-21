import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { INSTANCE_SIZES } from '@/constants';
import { GithubService } from '@/services';
import { Loader2, TicketPercent } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

type SetupPendingProps = {
  loading: boolean;
  setup: (data: {
    accountType: string;
    bundleId: string;
    awsSshKey?: string;
    awsAccessKey?: string;
    awsSecretKey?: string;
    awsRegion?: string;
    availabilityZone?: string;
  }) => void;
  projectId: string;
};

const SetupPending = ({ loading, setup, projectId }: SetupPendingProps) => {
  const [accountType, setAccountType] = useState('opengig');
  const [awsAccessKey, setAwsAccessKey] = useState('');
  const [awsSecretKey, setAwsSecretKey] = useState('');
  const [awsRegion, setAwsRegion] = useState('');
  const [availabilityZone, setAvailabilityZone] = useState('');
  const [awsSshKey, setAwsSshKey] = useState('');
  const [bundleId, setBundleId] = useState('');
  const [isgithubConnected, setIsgithubConnected] = useState(false);
  const [isRepoConnected, setIsRepoConnected] = useState(false);
  const handleRepoStatus = useCallback(async () => {
    const repoStatus = await GithubService.getGithubRepoByProjectId(projectId);
    if (repoStatus?.data?.githubRepoUrl) {
      setIsRepoConnected(true);
    } else {
      setIsRepoConnected(false);
    }
  }, [projectId]);

  const handleGithubStatus = async () => {
    const githubStatus = await GithubService.getGithubStatus();
    if (githubStatus?.data?.username) {
      setIsgithubConnected(true);
    }
  };

  const handleSetup = () => {
    if (accountType === 'opengig') {
      setup({ accountType, bundleId });
    } else {
      setup({
        accountType,
        awsAccessKey,
        awsSecretKey,
        awsRegion,
        availabilityZone,
        awsSshKey,
        bundleId,
      });
    }
  };
  useEffect(() => {
    handleGithubStatus();
    handleRepoStatus();
  }, [handleRepoStatus]);

  return (
    <Card className="w-full max-w-md border-amber-500/20 bg-amber-500/5">
      <CardContent className="flex flex-col items-center gap-6 p-8">
        <div className="rounded-full bg-linear-to-br from-amber-100 to-orange-100 p-4 shadow-inner">
          <TicketPercent size={40} className="text-amber-600" />
        </div>
        <div className="space-y-4 text-center">
          <h3 className="text-2xl font-semibold">VM Setup Required</h3>
          <p className="text-muted-foreground text-sm">
            We&apos;ll set up a dedicated virtual machine for your project
          </p>
          <p>
            <b> Make Sure Your Repo have a DockerCompose file </b>
          </p>
        </div>

        <RadioGroup
          defaultValue="opengig"
          className="w-full space-y-4"
          onValueChange={setAccountType}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="opengig" id="opengig" />
            <Label htmlFor="opengig">Use Heizen&apos;s AWS Account</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="self" id="self" />
            <Label htmlFor="self">Use Your AWS Account</Label>
          </div>
        </RadioGroup>

        <div className="w-full space-y-4">
          {accountType === 'opengig' ? (
            <div className="space-y-2">
              <Label>Select Bundle </Label>
              <Select onValueChange={setBundleId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select bundle" />
                </SelectTrigger>
                <SelectContent>
                  {INSTANCE_SIZES.map((size) => (
                    <SelectItem key={size.value} value={size.value}>
                      {size.label}
                    </SelectItem>
                  ))}
                  {/* <SelectItem value="micro_2_0">Micro ($5/month)</SelectItem>
                  <SelectItem value="small_2_0">Small ($10/month)</SelectItem> */}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label>AWS Access Key</Label>
                <Input
                  value={awsAccessKey}
                  onChange={(e) => setAwsAccessKey(e.target.value)}
                  placeholder="Enter AWS Access Key"
                />
              </div>
              <div className="space-y-2">
                <Label>AWS Secret Key</Label>
                <Input
                  type="password"
                  value={awsSecretKey}
                  onChange={(e) => setAwsSecretKey(e.target.value)}
                  placeholder="Enter AWS Secret Key"
                />
              </div>
              <div className="space-y-2">
                <Label>AWS Region</Label>
                <Input
                  value={awsRegion}
                  onChange={(e) => setAwsRegion(e.target.value)}
                  placeholder="e.g. us-east-1"
                />
              </div>
              <div className="space-y-2">
                <Label>Availability Zone</Label>
                <Input
                  value={availabilityZone}
                  onChange={(e) => setAvailabilityZone(e.target.value)}
                  placeholder="e.g. us-east-1a"
                />
              </div>
              <div className="space-y-2">
                <Label>AWS SSH Key</Label>
                <textarea
                  value={awsSshKey}
                  onChange={(e) => setAwsSshKey(e.target.value)}
                  placeholder="Paste your AWS SSH private key here like -----BEGIN RSA PRIVATE KEY-----"
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring min-h-[200px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="space-y-2">
                <Label>Select Bundle </Label>
                <Select onValueChange={setBundleId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select bundle" />
                  </SelectTrigger>
                  <SelectContent>
                    {INSTANCE_SIZES.map((size) => (
                      <SelectItem key={size.value} value={size.value}>
                        {size.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>

        {isgithubConnected && isRepoConnected ? (
          <>
            <div className="flex flex-col gap-2">
              <Button
                variant="default"
                size="lg"
                className="min-w-[200px] bg-linear-to-r from-amber-500 to-orange-500 text-white transition-all hover:from-amber-600 hover:to-orange-600"
                onClick={handleSetup}
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Initializing VM...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>Initialize VM</span>
                    <span className="text-lg">🚀</span>
                  </div>
                )}
              </Button>
              <p className="text-muted-foreground text-center text-xs">
                This will take approximately 5-10 minutes
              </p>
            </div>
          </>
        ) : (
          <div>
            <p>
              Please Connect Your Github Account and Connect Your Repo with Project to create VM
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SetupPending;

import { DeploymentService } from '@/services';
import { Project } from '@/types/project';
import { EventSource } from 'eventsource';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import SetupPending from './deployment/SetupPending';
import Setup from './deployment/Setup';
import NotStarted from './deployment/NotStarted';
import Queued from './deployment/Queued';
import InProgress from './deployment/InProgress';
import Failed from './deployment/Failed';
import Success from './deployment/Success';
import { Session } from 'next-auth';

type Props = {
  project: Project;
  session: Session;
  setProject: React.Dispatch<React.SetStateAction<Project>>;
};

const Deployment = ({ project, session }: Props) => {
  const [deploymentData, setDeploymentData] = useState({
    status: 'not_started',
    dnsName: '',
    lastLogs: {},
  });
  const sseRef = useRef<EventSource>(undefined);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(() => {
    sseRef.current?.close();
    const sse = new EventSource(`${process.env.NEXT_PUBLIC_API_URL}/cicd/${project.id}/status`, {
      withCredentials: true,
      fetch: (url, options) => {
        options.headers.Authorization = `Bearer ${session.token}`;
        return fetch(url, options);
      },
    });
    sseRef.current = sse;
    sse.onmessage = (e) => {
      const data = JSON.parse(e.data);
      console.log(data.type);
      if (data.type == 'waiting') {
        setDeploymentData((prev) => {
          return { ...prev, status: data.data.status };
        });
        return;
      }
      if (data.type == 'success') {
        setDeploymentData({
          status: 'success',
          dnsName: data.data.dnsName ?? '',
          lastLogs: data.data.lastLogs,
        });
        setLoading(false);
      }
      if (data.type == 'in_progress') {
        setDeploymentData((prev) => ({
          ...prev,
          status: 'in_progress',
        }));
        setLoading(false);
      }
      if (data.type == 'setup_pending' || data.type == 'null') {
        setDeploymentData((prev) => ({
          ...prev,
          status: 'setup_pending',
        }));
        setLoading(false);
      }
      if (data.type == 'failed') {
        setDeploymentData((prev) => ({
          ...prev,
          status: 'failed',
          lastLogs: data.data.lastLogs,
        }));
        setLoading(false);
      }

      sse.close();
    };
    sse.onerror = () => {
      setLoading(false);
      setDeploymentData({
        status: 'not_started',
        dnsName: '',
        lastLogs: {},
      });
      sse.close();
    };
    return sse;
  }, [project.id, session.token]);

  const deploy = async () => {
    setLoading(true);
    const res = await DeploymentService.deployProject(project.id);
    if (res) {
      fetchData();
      toast.success('Deployment started!');
    } else {
      setLoading(false);
      toast.error('Failed to deploy!');
    }
  };
  const setup = async (setupData: {
    accountType: string;
    bundleId: string;
    awsSshKey?: string;
    awsAccessKey?: string;
    awsSecretKey?: string;
    awsRegion?: string;
    availabilityZone?: string;
  }) => {
    setLoading(true);
    try {
      const res = await DeploymentService.setupVM(project.id, setupData);
      if (res) {
        fetchData();
        toast.success('VM setup started!');
      } else {
        setLoading(false);
        toast.error('Failed to setup VM!');
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
      toast.error('Failed to setup VM!');
    }
  };

  useEffect(() => {
    const sse = fetchData();

    return () => {
      sse?.close();
      sseRef.current?.close();
    };
  }, [fetchData]);

  const renderStatus = () => {
    if (!project.githubRepos?.length) {
      return (
        <div className="flex flex-col items-center justify-center space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Please connect your GitHub repository first to deploy your project.
          </p>
        </div>
      );
    }

    switch (deploymentData.status) {
      case 'setup_pending':
        return <SetupPending loading={loading} setup={setup} projectId={project.id} />;

      case 'setup':
        return <Setup uniqueName={project.uniqueName} />;

      case 'not_started':
        return <NotStarted deploy={deploy} loading={loading} />;

      case 'queued':
        return <Queued uniqueName={project.uniqueName} />;

      case 'in_progress':
        return <InProgress />;

      case 'failed':
        return <Failed deploy={deploy} lastLogs={deploymentData.lastLogs} />;

      case 'error':
        return <SetupPending loading={loading} setup={setup} projectId={project.id} />;

      case 'success':
        return (
          <Success
            deployment_url={deploymentData.dnsName}
            deploy={deploy}
            lastLogs={deploymentData.lastLogs}
          />
        );
    }
  };

  return (
    <div className="flex h-full w-full items-center justify-center p-2 sm:p-6">
      {renderStatus()}
    </div>
  );
};

export default Deployment;

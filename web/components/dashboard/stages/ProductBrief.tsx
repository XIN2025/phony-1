'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Project, ProjectAnalytics, UpdateProjectDto } from '@/types/project';
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  LayoutList,
  List,
  LucideIcon,
  Settings2,
  Edit,
  Save,
  XCircle,
  Calendar,
  LayoutDashboard,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  BarChart3,
  KanbanSquare,
  Globe,
  Tag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { ProjectService } from '@/services/project.api';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { countries } from '@/utils/countries';

type Props = {
  project: Project;
  setProject: (project: Project) => void;
};

const ProjectType = ['INTERNAL', 'EXTERNAL'];

const InfoItem: React.FC<{
  Icon: LucideIcon;
  label: string;
  value: string | number;
  className?: string;
}> = ({ Icon, label, value, className }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <Icon className="text-muted-foreground size-4" />
    <span className="text-muted-foreground text-sm font-medium">
      {label}: <span className="text-foreground">{value}</span>
    </span>
  </div>
);
const ProductBrief = ({ project, setProject }: Props) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(project.title);
  const [logoUrl, setLogoUrl] = useState(project.logoUrl || '');
  const [isUpdatingLogo, setIsUpdatingLogo] = useState(false);
  const [isLogoPopoverOpen, setIsLogoPopoverOpen] = useState(false);
  const [analytics, setAnalytics] = useState<ProjectAnalytics | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [isCountryPopoverOpen, setIsCountryPopoverOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(project?.countryOrigin || '');
  const [isUpdatingCountry, setIsUpdatingCountry] = useState(false);
  const [isProjectTypePopoverOpen, setIsProjectTypePopoverOpen] = useState(false);
  const [selectedProjectType, setSelectedProjectType] = useState(project?.projectType || '');
  const [isUpdatingProjectType, setIsUpdatingProjectType] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoadingAnalytics(true);
      try {
        const response = await ProjectService.getProjectAnalytics(project.id);
        if (response?.data) {
          setAnalytics(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch project analytics:', error);
      } finally {
        setIsLoadingAnalytics(false);
      }
    };

    fetchAnalytics();
  }, [project.id]);

  const handleLogoUpdate = async () => {
    setIsUpdatingLogo(true);
    try {
      const updatedProjectData: UpdateProjectDto = {
        title: project.title,
        clientRequirements: project.clientRequirements,
        thirdPartyIntegrations: project.thirdPartyIntegrations,
        logoUrl: logoUrl,
      };
      const updatedProject = await ProjectService.updateProject(project.id, updatedProjectData);

      if (updatedProject.data) {
        setProject({
          ...project,
          logoUrl,
        });
        toast.success('Project logo updated successfully.');
        setIsLogoPopoverOpen(false); // Close the popover
      } else {
        toast.error(updatedProject?.error?.message);
      }
    } catch {
      toast.error('Failed to update project logo.');
    } finally {
      setIsUpdatingLogo(false);
    }
  };

  const handleTitleUpdate = async () => {
    if (!editedTitle.trim()) {
      toast.error('Title cannot be empty.');
      return;
    }
    try {
      const updatedProjectData: UpdateProjectDto = {
        title: editedTitle,
        clientRequirements: project.clientRequirements,
        thirdPartyIntegrations: project.thirdPartyIntegrations,
      };
      const updatedProject = await ProjectService.updateProject(project.id, updatedProjectData);

      if (updatedProject.data) {
        setProject({
          ...project,
          title: editedTitle,
        });
        setIsEditingTitle(false);
        toast.success('Project title updated successfully.');
      } else {
        toast.error(updatedProject?.error?.message);
      }
    } catch {
      toast.error('Failed to update the project title.');
    }
  };

  const handleCountryUpdate = async () => {
    setIsUpdatingCountry(true);
    try {
      const updatedProjectData: UpdateProjectDto = {
        title: project.title,
        clientRequirements: project.clientRequirements,
        thirdPartyIntegrations: project.thirdPartyIntegrations,
        countryOrigin: selectedCountry,
      };
      const updatedProject = await ProjectService.updateProject(project.id, updatedProjectData);

      if (updatedProject.data) {
        setProject({
          ...project,
          countryOrigin: selectedCountry,
        });
        toast.success('Project country updated successfully.');
        setIsCountryPopoverOpen(false);
      } else {
        toast.error(updatedProject?.error?.message);
      }
    } catch {
      toast.error('Failed to update project country.');
    } finally {
      setIsUpdatingCountry(false);
    }
  };

  const handleProjectTypeUpdate = async () => {
    setIsUpdatingProjectType(true);
    try {
      const updatedProjectData: UpdateProjectDto = {
        title: project.title,
        clientRequirements: project.clientRequirements,
        thirdPartyIntegrations: project.thirdPartyIntegrations,
        projectType: selectedProjectType,
      };
      const updatedProject = await ProjectService.updateProject(project.id, updatedProjectData);

      if (updatedProject.data) {
        setProject({
          ...project,
          projectType: selectedProjectType,
        });
        toast.success('Project type updated successfully.');
        setIsProjectTypePopoverOpen(false);
      } else {
        toast.error(updatedProject?.error?.message);
      }
    } catch {
      toast.error('Failed to update project type.');
    } finally {
      setIsUpdatingProjectType(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <Popover open={isLogoPopoverOpen} onOpenChange={setIsLogoPopoverOpen}>
              <PopoverTrigger asChild>
                <Avatar className="size-16 cursor-pointer">
                  <AvatarImage src={project.logoUrl} alt={project.title} />
                  <AvatarFallback className="text-3xl">
                    {project.title.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="leading-none font-medium">Update Logo</h4>
                    <p className="text-muted-foreground text-sm">
                      Enter a URL for the project logo
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <Input
                      placeholder="Enter logo URL"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                    />
                    <Button onClick={handleLogoUpdate} disabled={isUpdatingLogo}>
                      {isUpdatingLogo ? 'Updating...' : 'Update Logo'}
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <div className="grid gap-1">
              {/* Title */}
              <div className="flex items-center gap-2">
                {isEditingTitle ? (
                  <>
                    <Input
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      className="w-auto font-bold"
                    />
                    <Button size="icon" onClick={handleTitleUpdate}>
                      <Save className="size-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => setIsEditingTitle(false)}>
                      <XCircle className="size-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <h1 className="text-2xl font-bold capitalize">{project.title}</h1>
                    <Button size="icon" variant="ghost" onClick={() => setIsEditingTitle(true)}>
                      <Edit className="size-4" />
                    </Button>
                  </>
                )}
              </div>

              <InfoItem Icon={Settings2} label="Model Type" value={project.modelType} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={'default'}>{project.uniqueName}</Badge>
            <Button variant={'outline'} size={'sm'} className="h-8" asChild>
              <Link href={`/dashboard/project/${project.uniqueName}`}>
                <LayoutDashboard className="mr-2 size-4" />
                Project Dashboard
              </Link>
            </Button>
          </div>
        </div>
        <Separator />
        <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-3">
          <InfoItem
            Icon={Calendar}
            label="Created At"
            value={format(new Date(project.createdAt), 'MMM d, yyyy')}
          />
          <InfoItem
            Icon={Calendar}
            label="Updated At"
            value={format(new Date(project.updatedAt), 'MMM d, yyyy')}
          />
          <Popover open={isProjectTypePopoverOpen} onOpenChange={setIsProjectTypePopoverOpen}>
            <PopoverTrigger asChild>
              <div>
                {project?.projectType ? (
                  <InfoItem
                    Icon={Tag}
                    label="Type"
                    value={project?.projectType}
                    className="hover:text-primary cursor-pointer"
                  />
                ) : (
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <Tag className="size-4" />
                    <span>Add Project Type</span>
                  </Button>
                )}
              </div>
            </PopoverTrigger>
            <PopoverContent
              onClick={(e) => e.stopPropagation()}
              className="w-[260px] overflow-hidden p-0"
              align="end"
            >
              <div className="border-b p-3">
                <h4 className="text-sm font-medium">Select Project Type</h4>
              </div>

              <div className="p-1">
                {ProjectType.map((item) => (
                  <div
                    key={item}
                    onClick={() => setSelectedProjectType(item)}
                    className={`flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm ${selectedProjectType === item ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'} `}
                  >
                    {item}
                  </div>
                ))}
              </div>

              <div className="border-t p-2">
                <Button
                  onClick={handleProjectTypeUpdate}
                  disabled={isUpdatingProjectType || !selectedProjectType}
                  className="w-full"
                  size="sm"
                >
                  {isUpdatingProjectType
                    ? 'Updating...'
                    : project.projectType
                      ? 'Update Project Type'
                      : 'Add Project Type'}
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          <Popover open={isCountryPopoverOpen} onOpenChange={setIsCountryPopoverOpen}>
            <PopoverTrigger asChild>
              <div>
                {project.countryOrigin ? (
                  <InfoItem
                    Icon={Globe}
                    label="Country"
                    value={project.countryOrigin}
                    className="hover:text-primary cursor-pointer"
                  />
                ) : (
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <Globe className="size-4" />
                    <span>Add Country</span>
                  </Button>
                )}
              </div>
            </PopoverTrigger>
            <PopoverContent
              onClick={(e) => e.stopPropagation()}
              className="w-[300px] p-0"
              align="end"
            >
              <Command>
                <CommandInput placeholder="Search countries..." />
                <CommandList>
                  <CommandEmpty>No countries found.</CommandEmpty>
                  <CommandGroup>
                    {countries.map((country) => (
                      <CommandItem
                        key={country.name}
                        value={country.name}
                        onSelect={() => {
                          setSelectedCountry(country.name);
                        }}
                        className={`flex w-full items-center space-x-2 ${selectedCountry === country.name ? 'bg-accent' : ''}`}
                      >
                        {country.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
                <div className="border-t p-2">
                  <Button
                    onClick={handleCountryUpdate}
                    disabled={isUpdatingCountry || !selectedCountry}
                    className="w-full"
                  >
                    {isUpdatingCountry
                      ? 'Updating...'
                      : project.countryOrigin
                        ? 'Update Country'
                        : 'Add Country'}
                  </Button>
                </div>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Analytics Dashboard */}
      <Card className="border-none p-0 shadow-none">
        <CardHeader className="p-3">
          <CardTitle className="flex items-center gap-2 max-sm:text-xl">
            <BarChart3 className="size-5" />
            Project Analytics
          </CardTitle>
          <CardDescription>Overview of project metrics and progress</CardDescription>
        </CardHeader>
        <CardContent className="p-3">
          {isLoadingAnalytics ? (
            <div className="flex h-40 items-center justify-center">
              <div className="border-primary h-8 w-8 animate-spin rounded-full border-t-2 border-b-2"></div>
            </div>
          ) : analytics ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Sprints Card */}
              <Card className="overflow-hidden">
                <CardHeader className="bg-muted/50 p-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <KanbanSquare className="size-4" />
                    Sprints
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">Total</span>
                      <span className="font-medium">{analytics.totalSprints}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">Active</span>
                      <span className="font-medium">{analytics.activeSprints}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">Completed</span>
                      <span className="font-medium">{analytics.completedSprints}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Meetings & Tasks Card */}
              <Card className="overflow-hidden">
                <CardHeader className="bg-muted/50 p-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Users className="size-4" />
                    Meetings & Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">Total Meetings</span>
                      <span className="font-medium">{analytics.totalMeetings}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">Total Tasks</span>
                      <span className="font-medium">{analytics.totalTasks}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stories Progress Card */}
              <Card className="overflow-hidden">
                <CardHeader className="bg-muted/50 p-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <LayoutList className="size-4" />
                    Stories Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">Total</span>
                      <span className="font-medium">{analytics.totalStories}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-1 text-xs">
                          <CheckCircle2 className="size-3 text-green-500" /> Completed
                        </span>
                        <span className="text-xs font-medium">
                          {analytics.completedStories} / {analytics.totalStories}
                        </span>
                      </div>
                      <Progress
                        value={
                          analytics.totalStories
                            ? (analytics.completedStories / analytics.totalStories) * 100
                            : 0
                        }
                        className="h-2"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-muted rounded-md p-1">
                        <div className="flex items-center justify-center gap-1">
                          <Clock className="size-3 text-blue-500" />
                          <span className="text-xs font-medium">{analytics.inProgressStories}</span>
                        </div>
                        <span className="text-muted-foreground text-[10px]">In Progress</span>
                      </div>
                      <div className="bg-muted rounded-md p-1">
                        <div className="flex items-center justify-center gap-1">
                          <AlertCircle className="size-3 text-amber-500" />
                          <span className="text-xs font-medium">{analytics.testingStories}</span>
                        </div>
                        <span className="text-muted-foreground text-[10px]">Testing</span>
                      </div>
                      <div className="bg-muted rounded-md p-1">
                        <div className="flex items-center justify-center gap-1">
                          <List className="size-3 text-gray-500" />
                          <span className="text-xs font-medium">{analytics.todoStories}</span>
                        </div>
                        <span className="text-muted-foreground text-[10px]">Todo</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center">
              <p className="text-muted-foreground">No Analytics Data available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductBrief;

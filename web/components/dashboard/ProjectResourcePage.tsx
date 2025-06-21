'use client';
import { Project } from '@/types/project';
import { CreateProjectResourceDto, ProjectResource } from '@/types/project-resource';
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { ProjectResourceService } from '@/services';
import { ResourceDialog, ResourceFormData } from './resources/ResourceDialog';
import { ResourceCard } from './resources/ResourceCard';
import { resourceTypes } from './resources/resource-types';
import { FolderKanban, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LoadingScreen from '../LoadingScreen';
import { Input } from '@/components/ui/input';

const ProjectResourcePage = ({ project }: { project: Project }) => {
  const [resources, setResources] = useState<ProjectResource[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentResource, setCurrentResource] = useState<ProjectResource | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      try {
        const data = await ProjectResourceService.getProjectResources(project.id);
        if (data.data) {
          setResources(data.data);
        } else {
          toast.error(data.error.message);
        }
      } catch {
        toast.error('Failed to fetch resources');
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, [project.id]);

  const handleAddResource = async (formData: CreateProjectResourceDto) => {
    try {
      const res = await ProjectResourceService.createProjectResource({
        ...formData,
      });
      if (res.data) {
        setResources((prev) => [...prev, res.data]);
        toast.success('Resource Added Successfully');
      } else {
        toast.error(res.error?.message);
      }
    } catch {
      toast.error('Failed to add resource');
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    try {
      const res = await ProjectResourceService.deleteProjectResource(resourceId);
      if (res.data) {
        setResources((prev) => prev.filter((r) => r.id !== resourceId));
        toast.success('Resource Deleted Successfully');
      } else {
        toast.error(res.error?.message);
      }
    } catch {
      toast.error('Failed to delete resource');
    }
  };

  const handleUpdateResource = async (resourceId: string, formData: ResourceFormData) => {
    try {
      const res = await ProjectResourceService.updateProjectResource(resourceId, formData);
      if (res.data) {
        setResources((prev) => prev.map((r) => (r.id === resourceId ? res.data : r)));
        toast.success('Resource Updated Successfully');
      } else {
        toast.error(res.error?.message);
      }
    } catch {
      toast.error('Failed to update resource');
    }
  };

  const filteredResources = resources.filter((resource) =>
    resource.resourceName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const groupedResources = filteredResources.reduce(
    (acc, resource) => {
      const type = resource.resourceType;
      if (!acc[type]) acc[type] = [];
      acc[type].push(resource);
      return acc;
    },
    {} as Record<string, ProjectResource[]>,
  );

  return (
    <div className="mx-auto w-full max-w-7xl p-2">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <FolderKanban className="text-primary h-5 w-5" />
            <h1 className="text-lg font-semibold">Project Resources</h1>
          </div>
          <p className="text-muted-foreground text-sm">Manage all your project resources</p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setCurrentResource(null);
            setOpen(true);
          }}
          className="max-sm:hidden"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Resource
        </Button>
        <Button
          onClick={() => {
            setCurrentResource(null);
            setOpen(true);
          }}
          className="sm:hidden"
          size="icon"
        >
          <Plus size={20} />
        </Button>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-[400px] pl-9"
          />
        </div>
      </div>

      <div className="grid gap-8">
        {resourceTypes.map((type) => {
          const typeResources = groupedResources[type.id] || [];
          if (typeResources.length === 0) return null;

          return (
            <section key={type.id}>
              <div className="mb-4 flex items-center gap-2">
                <type.icon className="text-primary h-5 w-5" />
                <h2 className="text-lg font-semibold">{type.label}</h2>
                <span className="text-muted-foreground text-sm">({typeResources.length})</span>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {typeResources.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    onDelete={() => handleDeleteResource(resource.id)}
                    onEdit={() => {
                      setCurrentResource(resource);
                      setOpen(true);
                    }}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {filteredResources.length === 0 && !loading && (
        <div className="py-12 text-center">
          <div className="text-muted-foreground">
            {searchQuery ? 'No matching resources found' : 'No resources added yet'}
          </div>
          <div className="text-muted-foreground mt-2 text-sm">
            You can add all your project resources to stay organized
          </div>
          <Button
            size="sm"
            onClick={() => {
              setCurrentResource(null);
              setOpen(true);
            }}
            className="my-2 gap-2 max-sm:hidden"
          >
            <Plus className="h-4 w-4" /> Add Resource
          </Button>
        </div>
      )}
      {resources.length === 0 && loading && <LoadingScreen type="logo" className="pt-20" />}
      <ResourceDialog
        open={open}
        setOpen={setOpen}
        resource={currentResource}
        projectId={project.id}
        onSubmit={async (data) => {
          if (currentResource) {
            await handleUpdateResource(currentResource.id, data);
          } else {
            await handleAddResource(data);
          }
        }}
      />
    </div>
  );
};

export default ProjectResourcePage;

'use client';
import { Project } from '@/types/project';
import React, { useEffect, useState } from 'react';
import StyleSelection from './steps/StyleSelection';
import ThemeSelection from './steps/ThemeSelection';
import { ArrowRightIcon, Edit, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon } from 'lucide-react';
import FinalView from './steps/FinalView';
import { ThemeDesign } from '@/types/design';
import { lightDefaultTheme } from '@/constants/colors';
import { darkDefaultTheme } from '@/constants/colors';
import { designStyleDefaults } from '@/constants/fonts';
import { ProjectService } from '@/services';
import { toast } from 'sonner';
import CopyThemeDialog from './CopyThemeDialog';
type Props = {
  project: Project;
};

const ProjectDesignPage = ({ project }: Props) => {
  const [step, setStep] = useState(project.designTheme ? 3 : 1);
  const [isEditing, setIsEditing] = useState(!project.designTheme);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isSaving, setIsSaving] = useState(false);
  const [themeDesign, setThemeDesign] = useState<ThemeDesign>({
    colors: {
      light: project.designTheme?.colors.light || lightDefaultTheme,
      dark: project.designTheme?.colors.dark || darkDefaultTheme,
    },
    typography: {
      heading: project.designTheme?.typography.heading || '',
      body: project.designTheme?.typography.body || '',
      fontLinks: project.designTheme?.typography.fontLinks || [],
    },
    style: project.designTheme?.style || '',
  });
  const [debouncedThemeDesign, setDebouncedThemeDesign] = useState<ThemeDesign>({
    colors: {
      light: project.designTheme?.colors.light || lightDefaultTheme,
      dark: project.designTheme?.colors.dark || darkDefaultTheme,
    },
    typography: {
      heading: project.designTheme?.typography.heading || '',
      body: project.designTheme?.typography.body || '',
      fontLinks: project.designTheme?.typography.fontLinks || [],
    },
    style: project.designTheme?.style || '',
  });
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedThemeDesign(themeDesign);
    }, 300);
    return () => clearTimeout(timeout);
  }, [themeDesign]);
  const getStep = () => {
    switch (step) {
      case 1:
        return (
          <StyleSelection
            currentStyle={debouncedThemeDesign.style}
            onStyleChange={(style) => {
              setThemeDesign(designStyleDefaults[style]);
              setStep(2);
            }}
          />
        );
      case 2:
        return (
          <ThemeSelection
            theme={theme}
            setTheme={setTheme}
            themeDesign={debouncedThemeDesign}
            setThemeDesign={setThemeDesign}
          />
        );
      case 3:
        return <FinalView themeDesign={debouncedThemeDesign} theme={theme} />;
      default:
        return null;
    }
  };
  const onSubmit = async () => {
    try {
      setIsSaving(true);
      const updatedProject = await ProjectService.updateProject(project.id, {
        title: project.title,
        clientRequirements: project.clientRequirements,
        thirdPartyIntegrations: project.thirdPartyIntegrations,
        designTheme: themeDesign,
      });
      if (updatedProject?.data) {
        toast.success('Project design updated successfully');
        setIsEditing(false);
      } else {
        toast.error(updatedProject?.error?.message);
      }
      setIsSaving(false);
    } catch (error) {
      console.error(error);
      setIsSaving(false);
    }
  };
  return (
    <div className="flex flex-col p-2 sm:p-4">
      {!isEditing ? (
        <div className="mb-2 flex justify-between">
          <div>
            <h1 className="text-xl font-semibold">Project Design</h1>
            <p className="text-muted-foreground text-sm">
              Customize your project design to your liking.
            </p>
          </div>
          <div className="flex gap-3">
            <CopyThemeDialog themeDesign={themeDesign} />
            <Button
              size="sm"
              className="gap-2"
              onClick={() => {
                setIsEditing(!isEditing);
                setStep(2);
              }}
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </div>
        </div>
      ) : (
        <div className="mb-2 flex justify-between">
          <Button
            size="sm"
            disabled={step === 1}
            className="gap-2"
            onClick={() => setStep(step - 1)}
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back
          </Button>
          <div className="flex gap-3">
            {step == 3 && (
              <Button
                size="sm"
                className="gap-2"
                onClick={() => {
                  onSubmit();
                }}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Save
                    <Save className="h-4 w-4" />
                  </>
                )}
              </Button>
            )}
            <Button
              size="sm"
              className="gap-2"
              disabled={step === 3 || (step == 1 && !themeDesign.style)}
              onClick={() => setStep(step + 1)}
            >
              Next
              <ArrowRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      {getStep()}
    </div>
  );
};

export default ProjectDesignPage;

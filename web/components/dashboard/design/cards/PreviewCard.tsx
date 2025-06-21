import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bell, ChevronDown, CreditCard, Settings, User } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { ThemeDesign } from '@/types/design';
import './font.css';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { CardHeader, CardContent } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { hslToOklch } from '@/utils/color';

type Props = {
  themeDesign: ThemeDesign;
  theme: 'light' | 'dark';
};

const PreviewCard = ({ themeDesign, theme }: Props) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current) return;

    // Apply heading font family to all heading elements within the card
    const headings = cardRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headings.forEach((heading) => {
      (heading as HTMLElement).style.fontFamily = themeDesign.typography.heading;
    });

    // Apply body font family to all non-heading text elements within the card
    const bodyElements = cardRef.current.querySelectorAll(
      'p, span, label, button, input, textarea',
    );
    bodyElements.forEach((element) => {
      (element as HTMLElement).style.fontFamily = themeDesign.typography.body;
    });
  }, [themeDesign.typography]);

  const getThemeVariables = () => {
    const colors = themeDesign.colors[theme];
    // convert to new oklch format
    return {
      ...colors,
      ...Object.fromEntries(
        Object.entries(colors).map(([key, value]) => [
          key,
          key === '--radius' ? value : hslToOklch(value),
        ]),
      ),
    } as React.CSSProperties;
  };

  return (
    <Card
      ref={cardRef}
      className="bg-background h-full overflow-auto p-4"
      style={getThemeVariables()}
    >
      <PreviewDesign />
    </Card>
  );
};

const PreviewDesign = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="space-y-4 p-2">
      {/* Header - More compact */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline">
            <Bell className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline">
                <Avatar className="h-6 w-6">
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <span className="ml-2 hidden sm:inline">John Doe</span>
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats Row - Same as before */}
      <div className="grid gap-4">
        {/* Top Row - Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { title: 'Revenue', value: '$45.2k', change: '+20.1%' },
            { title: 'Users', value: '2,350', change: '+10.1%' },
            { title: 'Active', value: '1.2k', change: '-5.1%' },
            { title: 'Tasks', value: '23', change: '+4.1%' },
          ].map((stat, i) => (
            <Card key={i} className="p-3">
              <p className="text-muted-foreground text-sm">{stat.title}</p>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-lg font-semibold">{stat.value}</span>
                <Badge variant={'default'} className="text-xs">
                  {stat.change}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* New Alert Section */}
      <Alert>
        <Bell className="h-4 w-4" />
        <AlertTitle>New Features Available</AlertTitle>
        <AlertDescription>
          Check out the new dashboard layout. More components coming soon.
        </AlertDescription>
      </Alert>

      {/* Main Content Grid */}
      <div className="grid gap-4">
        {/* Recent Activity */}
        <Card className="md:col-span-1 lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Recent Activity</h2>
              <Tabs defaultValue="all" className="w-[200px]">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="sales">Sales</TabsTrigger>
                  <TabsTrigger value="users">Users</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>U{i}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-sm">
                    <p className="font-medium">New user signed up</p>
                    <p className="text-muted-foreground">2 mins ago</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* New Components Section */}
        <div className="grid gap-4">
          <Card className="md:col-span-1">
            <CardHeader className="pb-2">
              <h2 className="font-semibold">Quick Actions</h2>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <Button className="h-16 flex-col" variant="default">
                  <User className="h-5 w-5" />
                  <span className="text-xs">Add User</span>
                </Button>
                <Button className="h-16 flex-col" variant="secondary">
                  <Settings className="h-5 w-5" />
                  <span className="text-xs">Settings</span>
                </Button>
                <Button className="h-16 flex-col" variant="outline">
                  <CreditCard className="h-5 w-5" />
                  <span className="text-xs">Billing</span>
                </Button>
                <Button className="h-16 flex-col" variant="outline">
                  <Bell className="h-5 w-5" />
                  <span className="text-xs">Alerts</span>
                </Button>
              </div>
            </CardContent>
          </Card>
          {/* Form Components Card */}
          <Card>
            <CardHeader className="pb-2">
              <h2 className="font-semibold">Form Elements</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Input Field</Label>
                <Input placeholder="Type something..." />
              </div>

              <div className="space-y-2">
                <Label>Text Area</Label>
                <Textarea placeholder="Enter description..." />
              </div>

              <div className="space-y-2">
                <Label>Checkbox Options</Label>
                <div className="flex flex-col gap-2">
                  {['Option 1', 'Option 2'].map((option) => (
                    <div key={option} className="flex items-center gap-2">
                      <Checkbox id={option} />
                      <Label htmlFor={option}>{option}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4">
          {/* Interactive Components Card */}
          <Card>
            <CardHeader className="pb-2">
              <h2 className="font-semibold">Interactive Elements</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tooltip Example</Label>
                <div className="flex gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm">
                        Hover Me
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Tooltip content here</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              <Accordion type="single" collapsible>
                <AccordionItem value="item-1">
                  <AccordionTrigger>Accordion Section</AccordionTrigger>
                  <AccordionContent>
                    This is the accordion content that can be toggled.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    Show Dialog
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction>Continue</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>

          {/* Status Components Card */}
          <Card>
            <CardHeader className="pb-2">
              <h2 className="font-semibold">Status Indicators</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Progress Indicators</Label>
                <Progress value={65} className="w-full" />
              </div>

              <div className="space-y-2">
                <Label>Status Badges</Label>
                <div className="flex flex-wrap gap-2">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="destructive">Error</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Toggle States</Label>
                <div className="flex items-center gap-4">
                  <Switch />
                  <Switch disabled />
                  <Switch checked />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Command Menu Demo */}
        <Card>
          <CardHeader className="pb-2">
            <h2 className="font-semibold">Advanced Controls</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Dropdown Selection</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Option 1</SelectItem>
                  <SelectItem value="2">Option 2</SelectItem>
                  <SelectItem value="3">Option 3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Range Control</Label>
              <Slider defaultValue={[33]} max={100} step={1} className="w-full" />
            </div>
          </CardContent>
        </Card>

        {/* Notifications Demo */}
        <Card>
          <CardHeader className="pb-2">
            <h2 className="font-semibold">Notification Center</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { title: 'System Update', desc: 'New version available', time: '2m ago' },
                { title: 'Security Alert', desc: 'Please review settings', time: '1h ago' },
              ].map((notif, i) => (
                <div key={i} className="flex items-center gap-4 rounded-lg border p-3">
                  <div className="flex-1">
                    <p className="font-medium">{notif.title}</p>
                    <p className="text-muted-foreground text-sm">{notif.desc}</p>
                  </div>
                  <Badge variant="outline">{notif.time}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Calendar */}
        <Card>
          <CardHeader className="pb-2">
            <h2 className="font-semibold">Calendar</h2>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="w-full rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader className="pb-2">
            <h2 className="font-semibold">Settings</h2>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Notifications</Label>
                <p className="text-muted-foreground text-xs">Get updates</p>
              </div>
              <Switch />
            </div>
            <Separator />
            <div className="space-y-1">
              <Label className="text-sm">Email Frequency</Label>
              <Select defaultValue="weekly">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-sm">Volume</Label>
              <Slider defaultValue={[66]} max={100} step={1} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PreviewCard;

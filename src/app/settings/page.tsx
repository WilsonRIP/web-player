"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useSettings, Settings } from "@/components/SettingsContext";

export default function SettingsPage() {
  const { toast } = useToast();
  const {
    settings,
    updateSettings,
    updateGeneralSettings,
    updatePlaybackSettings,
    updateAppearanceSettings,
    resetSettings,
  } = useSettings();

  // Import/Export functions
  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(
      dataStr
    )}`;

    const exportFileDefaultName = `web-player-settings-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();

    toast({
      title: "Settings Exported",
      description: "Your settings have been exported successfully.",
    });
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const { files } = event.target;

    if (files && files.length > 0) {
      fileReader.readAsText(files[0], "UTF-8");
      fileReader.onload = (e) => {
        const content = e.target?.result;
        if (typeof content === "string") {
          try {
            const parsedSettings = JSON.parse(content) as Settings;
            updateSettings(parsedSettings);
            toast({
              title: "Settings Imported",
              description: "Your settings have been imported successfully.",
            });
          } catch (error) {
            console.error("Error parsing imported settings:", error);
            toast({
              title: "Import Failed",
              description: "The imported file is not valid. Please try again.",
              variant: "destructive",
            });
          }
        }
      };
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="playback">Playback</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="shortcuts">Shortcuts</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Manage your account and application preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoplay" className="text-base">
                    Autoplay
                  </Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Automatically play media when opened
                  </p>
                </div>
                <Switch
                  id="autoplay"
                  checked={settings.general.autoplay}
                  onCheckedChange={(checked) =>
                    updateGeneralSettings("autoplay", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications" className="text-base">
                    Notifications
                  </Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Enable notification sounds
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={settings.general.notifications}
                  onCheckedChange={(checked) =>
                    updateGeneralSettings("notifications", checked)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="language" className="text-base">
                  Language
                </Label>
                <Select
                  value={settings.general.language}
                  onValueChange={(value) =>
                    updateGeneralSettings("language", value)
                  }
                >
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="spanish">Spanish</SelectItem>
                    <SelectItem value="french">French</SelectItem>
                    <SelectItem value="german">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="playback">
          <Card>
            <CardHeader>
              <CardTitle>Playback Settings</CardTitle>
              <CardDescription>
                Customize your media playback experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="default-volume" className="text-base">
                    Default Volume
                  </Label>
                  <span className="text-sm text-gray-500">
                    {settings.playback.defaultVolume}%
                  </span>
                </div>
                <Slider
                  id="default-volume"
                  value={[settings.playback.defaultVolume]}
                  max={100}
                  step={1}
                  onValueChange={([value]) =>
                    updatePlaybackSettings("defaultVolume", value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="default-speed" className="text-base">
                  Default Playback Speed
                </Label>
                <Select
                  value={settings.playback.defaultSpeed}
                  onValueChange={(value) =>
                    updatePlaybackSettings("defaultSpeed", value)
                  }
                >
                  <SelectTrigger id="default-speed">
                    <SelectValue placeholder="Select speed" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.5">0.5x</SelectItem>
                    <SelectItem value="0.75">0.75x</SelectItem>
                    <SelectItem value="1">1x (Normal)</SelectItem>
                    <SelectItem value="1.25">1.25x</SelectItem>
                    <SelectItem value="1.5">1.5x</SelectItem>
                    <SelectItem value="2">2x</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="loop" className="text-base">
                    Loop Playback
                  </Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Automatically replay media when finished
                  </p>
                </div>
                <Switch
                  id="loop"
                  checked={settings.playback.loop}
                  onCheckedChange={(checked) =>
                    updatePlaybackSettings("loop", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="skip-intro" className="text-base">
                    Skip Intro
                  </Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Automatically skip intros when detected
                  </p>
                </div>
                <Switch
                  id="skip-intro"
                  checked={settings.playback.skipIntro}
                  onCheckedChange={(checked) =>
                    updatePlaybackSettings("skipIntro", checked)
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>
                Customize the look and feel of the player
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="dark-mode" className="text-base">
                    Dark Mode
                  </Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Use dark theme
                  </p>
                </div>
                <Switch
                  id="dark-mode"
                  checked={settings.appearance.darkMode}
                  onCheckedChange={(checked) =>
                    updateAppearanceSettings("darkMode", checked)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="theme" className="text-base">
                  Color Theme
                </Label>
                <Select
                  value={settings.appearance.theme}
                  onValueChange={(value) =>
                    updateAppearanceSettings("theme", value)
                  }
                >
                  <SelectTrigger id="theme">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="purple">Purple</SelectItem>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="orange">Orange</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="subtitles" className="text-base">
                    Show Subtitles
                  </Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Display subtitles when available
                  </p>
                </div>
                <Switch
                  id="subtitles"
                  checked={settings.appearance.subtitles}
                  onCheckedChange={(checked) =>
                    updateAppearanceSettings("subtitles", checked)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="player-size" className="text-base">
                  Player Size
                </Label>
                <Select
                  value={settings.appearance.playerSize}
                  onValueChange={(value) =>
                    updateAppearanceSettings("playerSize", value)
                  }
                >
                  <SelectTrigger id="player-size">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                    <SelectItem value="fill">Fill Screen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shortcuts">
          <Card>
            <CardHeader>
              <CardTitle>Keyboard Shortcuts</CardTitle>
              <CardDescription>
                Customize keyboard controls for playback
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-md border p-3">
                    <div className="font-medium">Play/Pause</div>
                    <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Space
                    </div>
                  </div>
                  <div className="rounded-md border p-3">
                    <div className="font-medium">Mute/Unmute</div>
                    <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      M
                    </div>
                  </div>
                  <div className="rounded-md border p-3">
                    <div className="font-medium">Volume Up</div>
                    <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      ↑
                    </div>
                  </div>
                  <div className="rounded-md border p-3">
                    <div className="font-medium">Volume Down</div>
                    <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      ↓
                    </div>
                  </div>
                  <div className="rounded-md border p-3">
                    <div className="font-medium">Forward 10s</div>
                    <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      →
                    </div>
                  </div>
                  <div className="rounded-md border p-3">
                    <div className="font-medium">Backward 10s</div>
                    <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      ←
                    </div>
                  </div>
                  <div className="rounded-md border p-3">
                    <div className="font-medium">Increase Speed</div>
                    <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      +
                    </div>
                  </div>
                  <div className="rounded-md border p-3">
                    <div className="font-medium">Decrease Speed</div>
                    <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      -
                    </div>
                  </div>
                  <div className="rounded-md border p-3">
                    <div className="font-medium">Fullscreen</div>
                    <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      F
                    </div>
                  </div>
                  <div className="rounded-md border p-3">
                    <div className="font-medium">Subtitles</div>
                    <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      C
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-end">
        <input
          type="file"
          id="importSettings"
          className="hidden"
          accept=".json"
          onChange={importSettings}
        />
        <label htmlFor="importSettings">
          <Button variant="outline" className="w-full sm:w-auto" asChild>
            <span>Import Settings</span>
          </Button>
        </label>
        <Button
          variant="outline"
          className="w-full sm:w-auto"
          onClick={exportSettings}
        >
          Export Settings
        </Button>
        <Button
          variant="destructive"
          className="w-full sm:w-auto"
          onClick={resetSettings}
        >
          Reset to Defaults
        </Button>
      </div>
    </div>
  );
}

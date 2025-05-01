import React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="flex flex-col items-center p-4 md:p-8">
      <div className="w-full max-w-4xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-3xl">
              About Web Media Player
            </CardTitle>
            <CardDescription className="text-center">
              How to use the player and its features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h2 className="text-xl font-bold mb-2">Features</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Upload and play video files in various formats (MP4, WebM,
                  etc.)
                </li>
                <li>Upload and play audio files (MP3, WAV, OGG, etc.)</li>
                <li>Create and manage playlists</li>
                <li>Simple and intuitive user interface</li>
                <li>Playback controls (play, pause, seek, volume)</li>
                <li>Keyboard shortcuts for easier control</li>
                <li>Fullscreen support for videos</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-2">How to Use</h2>
              <ol className="list-decimal pl-6 space-y-2">
                <li>
                  Upload your media file by dragging and dropping or clicking
                  the upload area
                </li>
                <li>
                  Create playlists and add your media files to them using the
                  playlist manager
                </li>
                <li>
                  Browse your playlists in the sidebar and click on a file to
                  play it
                </li>
                <li>
                  Use the playback controls to play, pause, and adjust volume
                </li>
                <li>
                  For videos, click the fullscreen button to view in fullscreen
                  mode
                </li>
              </ol>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-2">Keyboard Shortcuts</h2>
              <ul className="grid grid-cols-2 gap-2">
                <li>
                  <span className="font-semibold">Space</span> - Play/Pause
                </li>
                <li>
                  <span className="font-semibold">Left Arrow</span> - Rewind 5
                  seconds
                </li>
                <li>
                  <span className="font-semibold">Right Arrow</span> - Forward 5
                  seconds
                </li>
                <li>
                  <span className="font-semibold">Up Arrow</span> - Volume Up
                </li>
                <li>
                  <span className="font-semibold">Down Arrow</span> - Volume
                  Down
                </li>
                <li>
                  <span className="font-semibold">M</span> - Mute/Unmute
                </li>
                <li>
                  <span className="font-semibold">F</span> - Toggle Fullscreen
                  (videos only)
                </li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Player
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}

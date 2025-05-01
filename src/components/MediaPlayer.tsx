"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  SkipForward,
  SkipBack,
  Forward,
  Rewind,
  Info,
  Minimize,
} from "lucide-react";
import { Slider } from "../components/ui/slider";
import { Button } from "../components/ui/button";
import { usePlaylist } from "./PlaylistContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
import { useSettings } from "./SettingsContext";

interface MediaPlayerProps {
  src: string;
  type: "video" | "audio";
}

export function MediaPlayer({ src, type }: MediaPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(75);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { currentPlaylist, playNext, playPrevious } = usePlaylist();
  const [showShortcutsInfo, setShowShortcutsInfo] = useState(false);

  // Get settings
  const { settings } = useSettings();

  // Initialize with settings
  useEffect(() => {
    if (mediaRef.current) {
      // Set volume from settings
      const initialVolume = settings.playback.defaultVolume;
      mediaRef.current.volume = initialVolume / 100;
      setVolume(initialVolume);

      // Set playback rate from settings
      const initialSpeed = parseFloat(settings.playback.defaultSpeed);
      mediaRef.current.playbackRate = initialSpeed;
      setPlaybackRate(initialSpeed);

      // Autoplay if enabled in settings
      if (settings.general.autoplay) {
        mediaRef.current.play().catch((error) => {
          console.error("Autoplay was prevented:", error);
        });
      }
    }
  }, [settings, src]);

  // Set loop
  useEffect(() => {
    if (mediaRef.current) {
      mediaRef.current.loop = settings.playback.loop;
    }
  }, [settings.playback.loop]);

  // Handle media events
  useEffect(() => {
    const media = mediaRef.current;
    if (!media) return;

    const handleLoadedMetadata = () => {
      setDuration(media.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(media.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    media.addEventListener("loadedmetadata", handleLoadedMetadata);
    media.addEventListener("timeupdate", handleTimeUpdate);
    media.addEventListener("ended", handleEnded);

    return () => {
      media.removeEventListener("loadedmetadata", handleLoadedMetadata);
      media.removeEventListener("timeupdate", handleTimeUpdate);
      media.removeEventListener("ended", handleEnded);
    };
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!mediaRef.current) return;

      // Only handle shortcuts if we're focused on the player
      if (
        !containerRef.current?.contains(document.activeElement) &&
        document.activeElement !== document.body
      )
        return;

      switch (e.code) {
        case "Space":
          e.preventDefault();
          togglePlayPause();
          break;
        case "ArrowRight":
          e.preventDefault();
          fastForward(5);
          break;
        case "ArrowLeft":
          e.preventDefault();
          rewind(5);
          break;
        case "Period":
          if (e.shiftKey) {
            e.preventDefault();
            // Increase playback speed
            const newSpeed = Math.min(playbackRate + 0.25, 2);
            handlePlaybackSpeedChange(newSpeed);
          }
          break;
        case "Comma":
          if (e.shiftKey) {
            e.preventDefault();
            // Decrease playback speed
            const newSpeed = Math.max(playbackRate - 0.25, 0.25);
            handlePlaybackSpeedChange(newSpeed);
          }
          break;
        case "Digit1":
          if (!e.ctrlKey && !e.altKey && !e.metaKey) {
            e.preventDefault();
            handlePlaybackSpeedChange(1); // Reset to normal speed
          }
          break;
        case "Digit2":
          if (!e.ctrlKey && !e.altKey && !e.metaKey) {
            e.preventDefault();
            handlePlaybackSpeedChange(2); // 2x speed
          }
          break;
        case "Digit5":
          if (!e.ctrlKey && !e.altKey && !e.metaKey) {
            e.preventDefault();
            handlePlaybackSpeedChange(0.5); // 0.5x speed
          }
          break;
        case "ArrowUp":
          e.preventDefault();
          adjustVolume(Math.min(volume + 5, 100));
          break;
        case "ArrowDown":
          e.preventDefault();
          adjustVolume(Math.max(volume - 5, 0));
          break;
        case "KeyM":
          e.preventDefault();
          toggleMute();
          break;
        case "KeyF":
          e.preventDefault();
          if (type === "video") toggleFullscreen();
          break;
        case "KeyN":
          e.preventDefault();
          if (currentPlaylist) playNext();
          break;
        case "KeyP":
          e.preventDefault();
          if (currentPlaylist) playPrevious();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    volume,
    isPlaying,
    isMuted,
    type,
    currentPlaylist,
    playNext,
    playPrevious,
    playbackRate,
  ]);

  // Auto-hide controls for video
  useEffect(() => {
    if (type !== "video") return;

    const resetControlsTimeout = () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      setShowControls(true);

      if (isPlaying) {
        controlsTimeoutRef.current = setTimeout(() => {
          setShowControls(false);
        }, 3000);
      }
    };

    resetControlsTimeout();

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying, type]);

  // Update playback speed when changed
  useEffect(() => {
    if (mediaRef.current) {
      mediaRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const togglePlayPause = () => {
    const media = mediaRef.current;
    if (!media) return;

    if (isPlaying) {
      media.pause();
    } else {
      media.play().catch((error) => {
        console.warn("Playback was prevented:", error);
      });
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    const media = mediaRef.current;
    if (!media) return;

    media.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const adjustVolume = (value: number) => {
    const media = mediaRef.current;
    if (!media) return;

    media.volume = value / 100;
    setVolume(value);

    if (value === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    const media = mediaRef.current;
    if (!media) return;

    media.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current
        .requestFullscreen()
        .then(() => {
          setIsFullscreen(true);
        })
        .catch((err) => {
          console.error(
            `Error attempting to enable full-screen mode: ${err.message}`
          );
        });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handlePlaybackSpeedChange = (speed: number) => {
    setPlaybackRate(speed);
  };

  const fastForward = (seconds: number) => {
    if (!mediaRef.current) return;

    const newTime = Math.min(mediaRef.current.currentTime + seconds, duration);
    mediaRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const rewind = (seconds: number) => {
    if (!mediaRef.current) return;

    const newTime = Math.max(mediaRef.current.currentTime - seconds, 0);
    mediaRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Apply player size from settings
  const getPlayerSize = () => {
    switch (settings.appearance.playerSize) {
      case "small":
        return "max-w-md";
      case "medium":
        return "max-w-2xl";
      case "large":
        return "max-w-4xl";
      case "fill":
        return "max-w-full";
      default:
        return "max-w-2xl";
    }
  };

  // Apply theme
  const getThemeColor = () => {
    switch (settings.appearance.theme) {
      case "purple":
        return "bg-purple-500 hover:bg-purple-600";
      case "blue":
        return "bg-blue-500 hover:bg-blue-600";
      case "green":
        return "bg-green-500 hover:bg-green-600";
      case "orange":
        return "bg-orange-500 hover:bg-orange-600";
      default:
        return "bg-primary hover:bg-primary/90";
    }
  };

  const controlTheme = getThemeColor();

  return (
    <div
      ref={containerRef}
      className={`relative rounded-lg overflow-hidden ${
        type === "video" ? "bg-black aspect-video" : "bg-accent/10 p-4"
      } ${getPlayerSize()} ${isFullscreen ? "w-full h-full" : ""}`}
      onMouseMove={() => {
        if (type === "video") {
          setShowControls(true);
          if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
          }
          if (isPlaying) {
            controlsTimeoutRef.current = setTimeout(() => {
              setShowControls(false);
            }, 3000);
          }
        }
      }}
    >
      {type === "video" ? (
        <>
          <video
            ref={mediaRef as React.RefObject<HTMLVideoElement>}
            src={src}
            className="w-full h-full"
            playsInline
          />
          <div
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
              isPlaying && !showControls
                ? "opacity-0"
                : "opacity-100 bg-black/30"
            }`}
            onClick={togglePlayPause}
          >
            {!isPlaying && (
              <Button
                size="icon"
                variant="secondary"
                className="h-12 w-12 rounded-full opacity-90"
                onClick={togglePlayPause}
              >
                <Play className="h-6 w-6" />
              </Button>
            )}
          </div>
        </>
      ) : (
        <audio
          ref={mediaRef as React.RefObject<HTMLAudioElement>}
          src={src}
          className="w-full"
        />
      )}

      {/* Keyboard shortcuts info */}
      {showShortcutsInfo && (
        <div
          className={`${
            isFullscreen ? "fixed" : "absolute"
          } inset-0 bg-black/80 flex items-center justify-center z-10 p-4`}
        >
          <div className="bg-background rounded-lg p-4 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Keyboard Shortcuts</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowShortcutsInfo(false)}
              >
                Close
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Space</div>
              <div>Play/Pause</div>
              <div>←</div>
              <div>Rewind 5s</div>
              <div>→</div>
              <div>Forward 5s</div>
              <div>↑</div>
              <div>Volume Up</div>
              <div>↓</div>
              <div>Volume Down</div>
              <div>M</div>
              <div>Mute/Unmute</div>
              <div>F</div>
              <div>Fullscreen</div>
              <div>1</div>
              <div>Normal Speed (1x)</div>
              <div>2</div>
              <div>Double Speed (2x)</div>
              <div>5</div>
              <div>Half Speed (0.5x)</div>
              <div>Shift + &gt;</div>
              <div>Increase Speed</div>
              <div>Shift + &lt;</div>
              <div>Decrease Speed</div>
              {currentPlaylist && currentPlaylist.items.length > 1 && (
                <>
                  <div>N</div>
                  <div>Next Track</div>
                  <div>P</div>
                  <div>Previous Track</div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div
        className={`
          absolute bottom-0 left-0 right-0 
          ${
            type === "video" ? (showControls ? "opacity-100" : "opacity-0") : ""
          }
          transition-opacity duration-300 p-2 bg-gradient-to-t from-black/70 to-transparent
        `}
      >
        <div className="flex flex-col space-y-1.5">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.01}
            onValueChange={handleSeek}
            className="cursor-pointer"
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={togglePlayPause}
                      className="h-8 w-8 text-white"
                    >
                      {isPlaying ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Play/Pause (Space)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => rewind(10)}
                      className="h-8 w-8 text-white"
                    >
                      <Rewind className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Rewind 10s (←)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => fastForward(10)}
                      className="h-8 w-8 text-white"
                    >
                      <Forward className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Forward 10s (→)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {currentPlaylist && currentPlaylist.items.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={playPrevious}
                    className="h-8 w-8 text-white"
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={playNext}
                    className="h-8 w-8 text-white"
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </>
              )}

              <span className="text-xs text-white">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowShortcutsInfo(true)}
                className="h-8 w-8 text-white"
                title="Keyboard shortcuts"
              >
                <Info className="h-4 w-4" />
              </Button>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-white text-xs"
                        >
                          {playbackRate}x
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map(
                          (speed) => (
                            <DropdownMenuItem
                              key={speed}
                              onClick={() => handlePlaybackSpeedChange(speed)}
                              className={
                                playbackRate === speed ? "bg-accent/50" : ""
                              }
                            >
                              {speed}x
                            </DropdownMenuItem>
                          )
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Playback Speed (1, 2, 5, Shift+&lt;, Shift+&gt;)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <div className="hidden sm:flex items-center space-x-2 pr-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMute}
                  className="h-8 w-8 text-white"
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={100}
                  step={1}
                  onValueChange={(value) => adjustVolume(value[0])}
                  className="w-20 cursor-pointer"
                />
              </div>

              {type === "video" && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleFullscreen}
                  className="h-8 w-8 text-white"
                >
                  <Maximize className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

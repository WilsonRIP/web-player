"use client";

import React, { useState, useEffect } from "react";
import { MediaPlayer } from "../../src/components/MediaPlayer";
import { FileUploader } from "../../src/components/FileUploader";
import { PlaylistManager } from "../../src/components/PlaylistManager";
import {
  usePlaylist,
  MediaItem,
  Playlist,
} from "../../src/components/PlaylistContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../src/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../src/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../src/components/ui/select";
import { Button } from "../../src/components/ui/button";
import { PlusCircle, Play, SkipBack, SkipForward } from "lucide-react";

// Helper function to guess media type from file extension
const guessMediaType = (fileName: string): "video" | "audio" => {
  const extension = fileName.split(".").pop()?.toLowerCase();
  if (["mp4", "mov", "avi", "webm", "mkv"].includes(extension || "")) {
    return "video";
  }
  if (["mp3", "wav", "ogg", "flac", "aac", "m4a"].includes(extension || "")) {
    return "audio";
  }
  // Default or based on MIME type if available?
  return "video"; // Defaulting to video for now
};

export default function PageClient() {
  const {
    playlists,
    currentPlaylist,
    currentMedia,
    addToPlaylist,
    playMedia,
    playNext,
    playPrevious,
  } = usePlaylist();

  const [file, setFile] = useState<File | null>(null);
  const [objectUrl, setObjectUrl] = useState<string>("");
  const [mediaType, setMediaType] = useState<"video" | "audio">("video");
  const [mediaName, setMediaName] = useState<string>("");
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>("");

  // Effect to sync player with current media from context
  useEffect(() => {
    if (currentMedia && !currentMedia.src.startsWith("blob:")) {
      // If the media source is not a temporary blob URL
      setObjectUrl(currentMedia.src);
      setMediaType(currentMedia.type);
      setMediaName(currentMedia.title);
      setFile(null); // Clear any potentially stale file object
    } else if (!currentMedia) {
      // If no media is playing, clear the local state
      if (objectUrl.startsWith("blob:")) {
        URL.revokeObjectURL(objectUrl);
      }
      setObjectUrl("");
      setFile(null);
      setMediaName("");
    }
    // Only react to context changes for non-blob URLs
  }, [
    currentMedia?.id,
    currentMedia?.src,
    currentMedia?.type,
    currentMedia?.title,
  ]);

  // Handle file selection from FileUploader
  const handleFileSelect = (selectedFile: File) => {
    // Revoke previous temporary object URL if it exists
    if (objectUrl.startsWith("blob:")) {
      URL.revokeObjectURL(objectUrl);
    }

    const newUrl = URL.createObjectURL(selectedFile);
    const type = guessMediaType(selectedFile.name);

    setObjectUrl(newUrl);
    setFile(selectedFile);
    setMediaType(type);
    setMediaName(selectedFile.name);

    // Create a temporary MediaItem for immediate playback
    const tempItem: MediaItem = {
      id: `temp-${Date.now()}`,
      title: selectedFile.name,
      src: newUrl,
      type: type,
      file: selectedFile, // Keep file ref if needed
    };
    playMedia(tempItem); // Play the uploaded file immediately
    setSelectedPlaylistId(""); // Reset playlist selection
  };

  // Add the currently selected *file* to a playlist
  const handleAddToPlaylist = () => {
    if (!file || !selectedPlaylistId || !objectUrl.startsWith("blob:")) return;

    const newItem: MediaItem = {
      id: `${selectedPlaylistId}-${Date.now()}`,
      title: mediaName || file.name,
      src: objectUrl, // Use the blob URL
      type: mediaType,
      file: file, // Include the file object
    };

    addToPlaylist(selectedPlaylistId, newItem);
    setSelectedPlaylistId("");
    // Maybe provide feedback? Toast notification?
    // We don't clear the file state here, as the user might want to add it to another playlist
  };

  // Handler for selecting an item from the PlaylistManager
  const handleSelectItem = (item: MediaItem, playlist: Playlist) => {
    playMedia(item, playlist);
  };

  const renderMediaPlayer = () => {
    if (currentMedia) {
      return (
        <MediaPlayer
          key={currentMedia.id}
          src={currentMedia.src}
          type={currentMedia.type}
        />
      );
    } else if (objectUrl.startsWith("blob:")) {
      // Render player for temporary uploaded file even if not in context yet
      return <MediaPlayer key={objectUrl} src={objectUrl} type={mediaType} />;
    }
    return null;
  };

  return (
    <div className="flex h-full">
      {/* Left side: File Upload / Playlist Selection */}
      <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle>Media Source</CardTitle>
            <CardDescription>
              Upload a file or select from a playlist.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <FileUploader onFileSelectClient={handleFileSelect} />
            {file && objectUrl.startsWith("blob:") && (
              <div className="mt-6 space-y-4">
                <p className="text-center">
                  Selected: <strong>{mediaName}</strong>
                </p>
                <Select
                  value={selectedPlaylistId}
                  onValueChange={setSelectedPlaylistId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select playlist to add to" />
                  </SelectTrigger>
                  <SelectContent>
                    {playlists.length > 0 ? (
                      playlists.map((playlist) => (
                        <SelectItem key={playlist.id} value={playlist.id}>
                          {playlist.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-playlists" disabled>
                        No playlists available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <Button
                  className="w-full"
                  onClick={handleAddToPlaylist}
                  disabled={!selectedPlaylistId}
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Add to Playlist
                </Button>
              </div>
            )}
            <hr className="my-4" />
            <PlaylistManager onSelectItem={handleSelectItem} />
          </CardContent>
        </Card>
      </div>

      {/* Right side: Media Player */}
      <main className="flex-1 p-4 overflow-y-auto">
        <div className="h-full flex items-center justify-center">
          <div className="w-full max-w-4xl">
            {renderMediaPlayer() ? (
              renderMediaPlayer()
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <p className="text-lg mb-2">No media selected.</p>
                <p>
                  Upload an audio or video file, or select one from your
                  playlists.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

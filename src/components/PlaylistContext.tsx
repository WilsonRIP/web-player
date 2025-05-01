"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useSettings } from "./SettingsContext";

export interface MediaItem {
  id: string;
  title: string;
  artist?: string;
  src: string;
  type: "audio" | "video";
  thumbnail?: string;
  duration?: number;
  file?: File; // Optional file property for uploaded files
}

export interface Playlist {
  id: string;
  name: string;
  items: MediaItem[];
}

export interface UserData {
  playlists: Playlist[];
  version: string;
  exportDate: string;
}

interface PlaylistContextType {
  playlists: Playlist[];
  currentPlaylist: Playlist | null;
  currentMedia: MediaItem | null;
  isPlaying: boolean;
  addPlaylist: (playlist: Playlist) => void;
  removePlaylist: (playlistId: string) => void;
  addToPlaylist: (playlistId: string, item: MediaItem) => void;
  removeFromPlaylist: (playlistId: string, itemId: string) => void;
  renamePlaylist: (playlistId: string, newName: string) => void;
  playMedia: (item: MediaItem, playlist?: Playlist) => void;
  playNext: () => void;
  playPrevious: () => void;
  togglePlay: () => void;
  setCurrentPlaylist: (playlist: Playlist | null) => void;
  exportUserData: () => void;
  importUserData: (file: File) => Promise<boolean>;
  clearAllData: () => void;
}

const PlaylistContext = createContext<PlaylistContextType | undefined>(
  undefined
);

export const PlaylistProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [currentPlaylist, setCurrentPlaylist] = useState<Playlist | null>(null);
  const [currentMedia, setCurrentMedia] = useState<MediaItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Get settings
  const { settings } = useSettings();

  // Load playlists from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPlaylists = localStorage.getItem("webPlayerPlaylists");
      if (savedPlaylists) {
        try {
          setPlaylists(JSON.parse(savedPlaylists));
        } catch (error) {
          console.error("Error parsing playlists:", error);
        }
      }
    }
  }, []);

  // Save playlists to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Remove file objects before saving to localStorage
      const playlistsToSave = playlists.map((playlist) => ({
        ...playlist,
        items: playlist.items.map((item) => {
          const { file, ...itemWithoutFile } = item;
          return itemWithoutFile;
        }),
      }));
      localStorage.setItem(
        "webPlayerPlaylists",
        JSON.stringify(playlistsToSave)
      );
    }
  }, [playlists]);

  // Add a new playlist
  const addPlaylist = (playlist: Playlist) => {
    setPlaylists([...playlists, playlist]);
  };

  // Remove a playlist
  const removePlaylist = (playlistId: string) => {
    setPlaylists(playlists.filter((p) => p.id !== playlistId));

    // If current playlist is removed, clear current playlist and media
    if (currentPlaylist?.id === playlistId) {
      setCurrentPlaylist(null);
      setCurrentMedia(null);
      setIsPlaying(false);
    }
  };

  // Add a media item to a playlist
  const addToPlaylist = (playlistId: string, item: MediaItem) => {
    setPlaylists(
      playlists.map((playlist) => {
        if (playlist.id === playlistId) {
          // Check if item already exists
          if (playlist.items.some((i) => i.id === item.id)) {
            return playlist;
          }
          return {
            ...playlist,
            items: [...playlist.items, item],
          };
        }
        return playlist;
      })
    );
  };

  // Remove a media item from a playlist
  const removeFromPlaylist = (playlistId: string, itemId: string) => {
    setPlaylists(
      playlists.map((playlist) => {
        if (playlist.id === playlistId) {
          return {
            ...playlist,
            items: playlist.items.filter((item) => item.id !== itemId),
          };
        }
        return playlist;
      })
    );

    // If current media is removed, play next or set to null
    if (currentMedia?.id === itemId && currentPlaylist?.id === playlistId) {
      const currentIndex = currentPlaylist.items.findIndex(
        (item) => item.id === itemId
      );

      // If there are more items after this one, play the next one
      if (currentIndex < currentPlaylist.items.length - 1) {
        playNext();
      } else if (currentIndex > 0) {
        // If there are items before this one, play the previous one
        playPrevious();
      } else {
        // If this is the only item, clear current media
        setCurrentMedia(null);
        setIsPlaying(false);
      }
    }
  };

  // Rename a playlist
  const renamePlaylist = (playlistId: string, newName: string) => {
    setPlaylists(
      playlists.map((playlist) => {
        if (playlist.id === playlistId) {
          return { ...playlist, name: newName };
        }
        return playlist;
      })
    );
    // Update currentPlaylist if it was the one renamed
    if (currentPlaylist?.id === playlistId) {
      setCurrentPlaylist((prev) => (prev ? { ...prev, name: newName } : null));
    }
  };

  // Play a media item
  const playMedia = (item: MediaItem, playlist?: Playlist) => {
    setCurrentMedia(item);

    if (playlist) {
      setCurrentPlaylist(playlist);
    }

    // Auto-play if autoplay is enabled
    if (settings.general.autoplay) {
      setIsPlaying(true);
    }
  };

  // Play the next item in the playlist
  const playNext = () => {
    if (!currentPlaylist || !currentMedia) return;

    const currentIndex = currentPlaylist.items.findIndex(
      (item) => item.id === currentMedia.id
    );

    if (currentIndex < currentPlaylist.items.length - 1) {
      setCurrentMedia(currentPlaylist.items[currentIndex + 1]);

      // Auto-play if loop is enabled
      if (settings.playback.loop || isPlaying) {
        setIsPlaying(true);
      }
    } else if (settings.playback.loop && currentPlaylist.items.length > 0) {
      // Loop back to the first item if loop is enabled
      setCurrentMedia(currentPlaylist.items[0]);

      if (isPlaying) {
        setIsPlaying(true);
      }
    } else {
      setIsPlaying(false);
    }
  };

  // Play the previous item in the playlist
  const playPrevious = () => {
    if (!currentPlaylist || !currentMedia) return;

    const currentIndex = currentPlaylist.items.findIndex(
      (item) => item.id === currentMedia.id
    );

    if (currentIndex > 0) {
      setCurrentMedia(currentPlaylist.items[currentIndex - 1]);

      if (isPlaying) {
        setIsPlaying(true);
      }
    } else if (settings.playback.loop && currentPlaylist.items.length > 0) {
      // Loop to the last item if loop is enabled
      setCurrentMedia(currentPlaylist.items[currentPlaylist.items.length - 1]);

      if (isPlaying) {
        setIsPlaying(true);
      }
    }
  };

  // Toggle play state
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // Export user data as JSON file
  const exportUserData = () => {
    // Create a copy of playlists without File objects
    const exportData = {
      playlists: playlists.map((playlist) => ({
        ...playlist,
        items: playlist.items.map((item) => {
          const { file, ...itemWithoutFile } = item;
          return itemWithoutFile;
        }),
      })),
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(
      dataStr
    )}`;
    const exportName = `web-player-data-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportName);
    linkElement.click();
  };

  // Import user data from JSON file
  const importUserData = async (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const jsonData = JSON.parse(event.target?.result as string);

          if (
            jsonData &&
            jsonData.playlists &&
            Array.isArray(jsonData.playlists)
          ) {
            // Reset current selections
            setCurrentPlaylist(null);
            setCurrentMedia(null);

            // Set the imported playlists
            setPlaylists(jsonData.playlists);
            resolve(true);
          } else {
            console.error("Invalid playlist data format");
            resolve(false);
          }
        } catch (error) {
          console.error("Error parsing import data:", error);
          resolve(false);
        }
      };

      reader.onerror = () => {
        console.error("Error reading file");
        resolve(false);
      };

      reader.readAsText(file);
    });
  };

  // Clear all data
  const clearAllData = () => {
    setPlaylists([]);
    setCurrentPlaylist(null);
    setCurrentMedia(null);
    setIsPlaying(false);
    localStorage.removeItem("webPlayerPlaylists");
  };

  const value = {
    playlists,
    currentPlaylist,
    currentMedia,
    isPlaying,
    addPlaylist,
    removePlaylist,
    addToPlaylist,
    removeFromPlaylist,
    renamePlaylist,
    playMedia,
    playNext,
    playPrevious,
    togglePlay,
    setCurrentPlaylist,
    exportUserData,
    importUserData,
    clearAllData,
  };

  return (
    <PlaylistContext.Provider value={value}>
      {children}
    </PlaylistContext.Provider>
  );
};

export const usePlaylist = () => {
  const context = useContext(PlaylistContext);
  if (!context) {
    throw new Error("usePlaylist must be used within a PlaylistProvider");
  }
  return context;
};

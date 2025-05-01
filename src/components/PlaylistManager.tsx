"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../src/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../src/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../src/components/ui/dialog";
import { Button } from "../../src/components/ui/button";
import { Input } from "../../src/components/ui/input";
import { usePlaylist, MediaItem, Playlist } from "./PlaylistContext";
import { PlusCircle, List, Music, Video, Edit, Trash2 } from "lucide-react";

interface PlaylistManagerProps {
  onSelectItem: (item: MediaItem, playlist: Playlist) => void;
}

export function PlaylistManager({ onSelectItem }: PlaylistManagerProps) {
  const {
    playlists,
    addPlaylist,
    removePlaylist,
    renamePlaylist,
    currentPlaylist,
    currentMedia,
  } = usePlaylist();

  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [editingPlaylistId, setEditingPlaylistId] = useState<string | null>(
    null
  );
  const [editedName, setEditedName] = useState("");

  const handleAddPlaylist = () => {
    if (newPlaylistName.trim() === "") return;
    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name: newPlaylistName.trim(),
      items: [],
    };
    addPlaylist(newPlaylist);
    setNewPlaylistName("");
  };

  const handleRenamePlaylist = (playlistId: string) => {
    if (editedName.trim() === "") return;
    renamePlaylist(playlistId, editedName.trim());
    setEditingPlaylistId(null);
    setEditedName("");
  };

  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full mb-4">
            <PlusCircle className="mr-2 h-4 w-4" /> Create New Playlist
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Playlist</DialogTitle>
            <DialogDescription>
              Enter a name for your new playlist.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="Playlist Name"
            />
          </div>
          <DialogFooter>
            <DialogTrigger asChild>
              <Button onClick={handleAddPlaylist}>Create</Button>
            </DialogTrigger>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Accordion type="single" collapsible className="w-full">
        {playlists.map((playlist) => (
          <AccordionItem value={playlist.id} key={playlist.id}>
            <AccordionTrigger
              className={`flex justify-between items-center ${
                currentPlaylist?.id === playlist.id ? "font-semibold" : ""
              }`}
            >
              <div className="flex items-center space-x-2">
                <List className="h-4 w-4" />
                {editingPlaylistId === playlist.id ? (
                  <Input
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    onBlur={() => handleRenamePlaylist(playlist.id)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleRenamePlaylist(playlist.id)
                    }
                    className="h-6 px-1 text-sm"
                    autoFocus
                    onClick={(e) => e.stopPropagation()} // Prevent trigger close
                  />
                ) : (
                  <span>{playlist.name}</span>
                )}
              </div>
              <div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 mr-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingPlaylistId(playlist.id);
                    setEditedName(playlist.name);
                  }}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent Accordion trigger
                    removePlaylist(playlist.id);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              {playlist.items.length > 0 ? (
                <ul className="space-y-1 pl-4">
                  {playlist.items.map((item: MediaItem) => (
                    <li
                      key={item.id}
                      className={`text-sm p-1 rounded cursor-pointer hover:bg-accent/50 ${
                        currentMedia?.id === item.id &&
                        currentPlaylist?.id === playlist.id
                          ? "bg-accent font-medium"
                          : "text-muted-foreground"
                      }`}
                      onClick={() => {
                        onSelectItem(item, playlist);
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        {item.type === "video" ? (
                          <Video className="h-3 w-3" />
                        ) : (
                          <Music className="h-3 w-3" />
                        )}
                        <span className="truncate">{item.title}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground pl-4 italic">
                  Playlist is empty
                </p>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

export function PlaylistDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <List className="h-4 w-4 mr-2" />
          Playlists
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Manage Playlists</DialogTitle>
        </DialogHeader>
        <PlaylistManager onSelectItem={() => {}} />
      </DialogContent>
    </Dialog>
  );
}

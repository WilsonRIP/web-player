"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../lib/utils";
import { Button } from "../components/ui/button";
import { PlaylistDialog } from "./PlaylistManager";
import { usePlaylist, Playlist, MediaItem } from "./PlaylistContext";
import {
  Home,
  Info,
  Github,
  Music,
  Video,
  Menu,
  List,
  Play,
  X,
  Upload,
  Settings,
  Database,
  PlusCircle,
  Trash2,
  Edit,
  FileText,
  ChevronDown,
  ChevronRight,
  Download,
} from "lucide-react";
import { ScrollArea } from "../../src/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "../../src/components/ui/sheet";
import { DataManager } from "./DataManager";
import { Input } from "../../src/components/ui/input";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const {
    playlists,
    addPlaylist,
    removePlaylist,
    renamePlaylist,
    setCurrentPlaylist,
    currentPlaylist,
    currentMedia,
    playMedia,
    removeFromPlaylist,
  } = usePlaylist();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    {
      name: "Home",
      href: "/",
      icon: <Home className="h-4 w-4" />,
    },
    {
      name: "Download",
      href: "/download",
      icon: <Download className="h-4 w-4" />,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: <Settings className="h-4 w-4" />,
    },
    {
      name: "About",
      href: "/about",
      icon: <Info className="h-4 w-4" />,
    },
  ];

  const SidebarContent = (
    <>
      <div className="px-3 py-2">
        <Link href="/" className="flex items-center mb-6">
          <div className="text-xl font-bold flex items-center mx-1.5">
            <Play className="h-6 w-6 mr-2 text-primary" />
            WebPlayer
          </div>
        </Link>

        <div className="space-y-4">
          <div className="py-2">
            <h3 className="mb-2 px-4 text-sm font-semibold">Navigation</h3>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
                  )}
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}

              <DataManager />

              <a
                href="https://github.com/WilsonRIP"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/50 hover:text-accent-foreground"
              >
                <Github className="h-4 w-4" />
                GitHub
              </a>
            </nav>
          </div>

          <div className="py-2">
            <div className="flex items-center justify-between mb-2 px-4">
              <h3 className="text-sm font-semibold">Playlists</h3>
              <PlaylistDialog />
            </div>

            <ScrollArea className="h-[calc(100vh-350px)]">
              <div className="space-y-1 px-1">
                {playlists.length === 0 ? (
                  <p className="text-xs text-muted-foreground px-3 py-2 italic">
                    No playlists yet
                  </p>
                ) : (
                  playlists.map((playlist) => (
                    <PlaylistAccordion
                      key={playlist.id}
                      playlist={playlist}
                      isCurrentPlaylist={currentPlaylist?.id === playlist.id}
                      currentMediaId={currentMedia?.id}
                      onSelectPlaylist={() => setCurrentPlaylist(playlist)}
                      onPlayItem={(item) => playMedia(item, playlist)}
                      onRemoveItem={(itemId) =>
                        removeFromPlaylist(playlist.id, itemId)
                      }
                      onRenamePlaylist={renamePlaylist}
                      onDeletePlaylist={removePlaylist}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Sidebar Toggle */}
      <div className="fixed top-4 left-4 z-40 md:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="rounded-full">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[270px]">
            {SidebarContent}
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div
        className={cn(
          "hidden md:flex h-screen w-64 flex-col border-r bg-background z-30 sticky top-0 left-0",
          className
        )}
      >
        {SidebarContent}
      </div>
    </>
  );
}

interface PlaylistAccordionProps {
  playlist: Playlist;
  isCurrentPlaylist: boolean;
  currentMediaId: string | null | undefined;
  onSelectPlaylist: () => void;
  onPlayItem: (item: MediaItem) => void;
  onRemoveItem: (itemId: string) => void;
  onRenamePlaylist: (id: string, newName: string) => void;
  onDeletePlaylist: (id: string) => void;
}

function PlaylistAccordion({
  playlist,
  isCurrentPlaylist,
  currentMediaId,
  onSelectPlaylist,
  onPlayItem,
  onRemoveItem,
  onRenamePlaylist,
  onDeletePlaylist,
}: PlaylistAccordionProps) {
  const [isOpen, setIsOpen] = useState(isCurrentPlaylist);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(playlist.name);

  const handleRename = () => {
    if (newName.trim() && newName !== playlist.name) {
      onRenamePlaylist(playlist.id, newName.trim());
    }
    setIsEditing(false);
  };

  return (
    <div className="mb-1">
      <div
        className={`flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
          isCurrentPlaylist ? "bg-gray-100 dark:bg-gray-700" : ""
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div
          className="flex items-center flex-grow min-w-0"
          onClick={(e) => {
            e.stopPropagation();
            onSelectPlaylist();
          }}
        >
          {isOpen ? (
            <ChevronDown size={16} className="mr-1 flex-shrink-0" />
          ) : (
            <ChevronRight size={16} className="mr-1 flex-shrink-0" />
          )}
          {isEditing ? (
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => e.key === "Enter" && handleRename()}
              className="h-6 px-1 text-sm flex-grow min-w-0 mr-1"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span
              className="text-sm font-medium truncate"
              title={playlist.name}
            >
              {playlist.name}
            </span>
          )}
        </div>
        <div className="flex-shrink-0 flex items-center space-x-1 ml-1">
          {!isEditing && (
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
            >
              <Edit size={12} />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5"
            onClick={(e) => {
              e.stopPropagation();
              onDeletePlaylist(playlist.id);
            }}
          >
            <Trash2 size={12} />
          </Button>
        </div>
      </div>
      {isOpen && (
        <div className="pl-4 pt-1 pb-1 space-y-1">
          {playlist.items.length === 0 ? (
            <p className="text-xs text-gray-500 dark:text-gray-400 px-2">
              Playlist is empty
            </p>
          ) : (
            playlist.items.map((item) => (
              <div
                key={item.id}
                className={`flex items-center justify-between px-2 py-1 rounded-md text-sm cursor-pointer group hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  currentMediaId === item.id
                    ? "bg-gray-100 dark:bg-gray-700 font-semibold"
                    : ""
                }`}
                onClick={() => onPlayItem(item)}
              >
                <span className="truncate" title={item.title}>
                  {item.title}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveItem(item.id);
                  }}
                >
                  <X size={12} />
                </Button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useRef } from "react";
import { Button } from "../../src/components/ui/button";
import { usePlaylist } from "./PlaylistContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "../../src/components/ui/dialog";
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
} from "../../src/components/ui/alert-dialog";
import { toast } from "../../src/components/ui/use-toast";
import { Download, Upload, Trash2 } from "lucide-react";

export function DataManager() {
  const { exportUserData, importUserData, clearAllData, playlists } =
    usePlaylist();
  const [isImporting, setIsImporting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    if (playlists.length === 0) {
      toast({
        title: "No data to export",
        description: "You don't have any playlists to export.",
        variant: "destructive",
      });
      return;
    }

    exportUserData();
    toast({
      title: "Data exported successfully",
      description: "Your playlists have been exported to a file.",
    });
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const success = await importUserData(file);
      if (success) {
        toast({
          title: "Data imported successfully",
          description: "Your playlists have been imported.",
        });
        setDialogOpen(false);
      } else {
        toast({
          title: "Import failed",
          description:
            "There was an error importing your data. Please check the file format.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Import error:", error);
      toast({
        title: "Import failed",
        description: "An unexpected error occurred during import.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleClearData = () => {
    clearAllData();
    toast({
      title: "Data cleared",
      description: "All your playlists have been removed.",
    });
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          Data Manager
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Your Data</DialogTitle>
          <DialogDescription>
            Export your playlists to a file, or import from a previously
            exported file.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={handleExport}
              className="flex items-center gap-2"
              disabled={playlists.length === 0}
            >
              <Download className="h-4 w-4" />
              Export Data
            </Button>

            <Button
              onClick={handleImportClick}
              className="flex items-center gap-2"
              disabled={isImporting}
            >
              <Upload className="h-4 w-4" />
              Import Data
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                className="hidden"
              />
            </Button>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="mt-2 flex items-center gap-2"
                disabled={playlists.length === 0}
              >
                <Trash2 className="h-4 w-4" />
                Clear All Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all your playlists and their
                  contents. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearData}>
                  Yes, delete everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <DialogFooter className="sm:justify-end">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

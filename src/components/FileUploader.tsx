"use client";

import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud } from "lucide-react";

interface FileUploaderProps {
  onFileSelectClient: (file: File) => void;
}

export function FileUploader({ onFileSelectClient }: FileUploaderProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileSelectClient(acceptedFiles[0]);
      }
    },
    [onFileSelectClient]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/*": [".mp4", ".mov", ".avi", ".webm", ".mkv"],
      "audio/*": [".mp3", ".wav", ".ogg", ".flac", ".aac", ".m4a"],
    },
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
        isDragActive
          ? "border-primary bg-primary/10"
          : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
      }`}
    >
      <input {...getInputProps()} />
      <UploadCloud className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      {isDragActive ? (
        <p className="text-lg font-medium">Drop the file here ...</p>
      ) : (
        <p className="text-lg font-medium">
          Drag 'n' drop a media file here, or click to select
        </p>
      )}
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
        Supported formats: MP4, MOV, AVI, WEBM, MKV, MP3, WAV, OGG, FLAC, AAC,
        M4A
      </p>
    </div>
  );
}

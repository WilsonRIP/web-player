"use client";

import React, { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, ClipboardCopy } from "lucide-react";
import { toast } from "react-hot-toast";

/** Simple utility so we don’t re-implement URL regexes */
const isValidUrl = (value: string) => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

export default function DownloadPage() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadInfo, setDownloadInfo] = useState<{
    url: string;
    filename: string;
  } | null>(null);

  // allow “Copied!” toast to appear near the trigger button
  const linkButtonRef = useRef<HTMLButtonElement>(null);

  const handleDownload = async () => {
    if (!isValidUrl(url)) {
      setError("Please enter a valid URL.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setDownloadInfo(null);

    try {
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) {
        // surfacing server error messages when provided
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson?.details || res.statusText);
      }

      const data = await res.json();
      if (!data.downloadUrl || !data.filename)
        throw new Error("Response did not include a download URL.");

      setDownloadInfo({ url: data.downloadUrl, filename: data.filename });
      toast.success("Video link ready!");
      setUrl("");
    } catch (e: any) {
      console.error(e);
      setError(e.message ?? "Something went wrong.");
      toast.error(e.message ?? "Download failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-lg mx-auto">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleDownload();
          }}
        >
          <CardHeader>
            <CardTitle>Download Video</CardTitle>
            <CardDescription>
              Paste the video URL and we’ll fetch the direct link for you.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="video-url">Video URL</Label>
              <Input
                id="video-url"
                type="url"
                autoFocus
                placeholder="https://example.com/video"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setError(null);
                  setDownloadInfo(null);
                }}
                disabled={isLoading}
                className={
                  error ? "ring-2 ring-red-500 focus:ring-red-500" : ""
                }
              />
              <p
                role="alert"
                aria-live="polite"
                className="text-sm text-red-500 h-5"
              >
                {error}
              </p>
            </div>

            {downloadInfo && (
              <div className="space-y-2 pt-2">
                <Label>Your video link:</Label>
                <div className="flex items-center gap-2">
                  <a
                    href={downloadInfo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all"
                  >
                    {downloadInfo.filename}
                  </a>
                  <Button
                    ref={linkButtonRef}
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      navigator.clipboard.writeText(downloadInfo.url);
                      toast.success("Copied!", {
                        position: "bottom-center",
                      });
                    }}
                    aria-label="Copy link to clipboard"
                  >
                    <ClipboardCopy size={16} />
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Can’t click? Check your pop-up blocker.
                </p>
              </div>
            )}
          </CardContent>

          <CardFooter>
            <Button
              className="w-full"
              disabled={isLoading || !url}
              type="submit"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing…
                </>
              ) : (
                "Get Video Link"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

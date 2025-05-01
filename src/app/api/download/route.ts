import { NextRequest, NextResponse } from "next/server";
// import ytdl from "@distube/ytdl-core"; // Remove ytdl import
import YtDlpWrap from "yt-dlp-wrap"; // Correct default import
// import path from "path"; // Needed for yt-dlp-wrap binary path
// import os from "os";

// Initialize YtDlpWrap
let ytDlpWrapInstance: YtDlpWrap | null = null;

try {
  // Initialize YtDlpWrap without a path.
  // It will attempt to find yt-dlp in PATH or download it automatically.
  // On Vercel, this should download to the writable /tmp directory.
  console.log("Attempting to initialize YtDlpWrap with automatic download...");
  ytDlpWrapInstance = new YtDlpWrap();
  console.log("YtDlpWrap initialized successfully (potentially downloaded).");
} catch (error) {
  console.error("Failed to initialize YtDlpWrap:", error);
}

// No longer need PassThrough directly for this approach
// import { PassThrough } from "stream";

export async function POST(request: NextRequest) {
  if (!ytDlpWrapInstance) {
    return NextResponse.json(
      { error: "yt-dlp backend not initialized" },
      { status: 500 }
    );
  }

  const { url } = await request.json();

  if (!url || typeof url !== "string") {
    return NextResponse.json(
      { error: "Video URL is required" },
      { status: 400 }
    );
  }

  console.log(`API received request to download via yt-dlp: ${url}`);

  try {
    // Wrap the yt-dlp execution in a promise to handle async events
    const videoInfo = await new Promise<any>((resolve, reject) => {
      let stdoutData = "";
      let stderrData = "";

      const eventEmitter = ytDlpWrapInstance!.exec([
        url,
        "--dump-json",
        // Add any other necessary flags here
      ]);

      console.log("yt-dlp EventEmitter/Process created.");

      // Access the underlying ChildProcess stdout/stderr streams
      if (
        !eventEmitter.ytDlpProcess ||
        !eventEmitter.ytDlpProcess.stdout ||
        !eventEmitter.ytDlpProcess.stderr
      ) {
        return reject(new Error("Failed to access yt-dlp process streams."));
      }

      eventEmitter.ytDlpProcess.stdout.on("data", (data) => {
        const chunk = data.toString();
        // console.log("yt-dlp stdout chunk:", chunk); // Optional: log chunks
        stdoutData += chunk;
      });

      eventEmitter.ytDlpProcess.stderr.on("data", (data) => {
        const chunk = data.toString();
        // console.error("yt-dlp stderr chunk:", chunk); // Optional: log chunks
        stderrData += chunk;
      });

      eventEmitter.on("error", (error) => {
        console.error("yt-dlp wrapper error:", error);
        reject(new Error(`yt-dlp wrapper failed: ${error.message}`));
      });

      eventEmitter.on("close", (code: number | null) => {
        console.log(`yt-dlp process closed with code: ${code}`);
        if (code !== 0) {
          // Reject if the process exited with an error code
          console.error(
            `yt-dlp exited with code ${code}. stderr: ${stderrData}`
          );
          reject(
            new Error(
              `yt-dlp exited with code ${code}. Error: ${stderrData.trim()}`
            )
          );
          return;
        }

        // Check if stdout has data
        if (stdoutData.trim() === "") {
          console.error("yt-dlp stdout is empty. stderr:", stderrData);
          reject(new Error("yt-dlp did not return valid JSON output."));
          return;
        }

        // Try parsing the accumulated stdout data
        try {
          const parsedData = JSON.parse(stdoutData);
          console.log("Successfully parsed yt-dlp JSON output.");
          resolve(parsedData);
        } catch (parseError) {
          console.error("Failed to parse yt-dlp JSON output:", parseError);
          console.error("Raw stdout:", stdoutData);
          // Handle unknown type for parseError
          const errorMessage =
            parseError instanceof Error
              ? parseError.message
              : String(parseError);
          reject(new Error(`Failed to parse yt-dlp output: ${errorMessage}`));
        }
      });
    });

    // --- Format Selection Logic ---
    let selectedFormat: any = null;

    if (Array.isArray(videoInfo?.formats)) {
      // Prioritize format_id '18' (MP4 360p with audio) if available
      selectedFormat = videoInfo.formats.find(
        (f: any) => f.format_id === "18" && f.url
      );

      // Fallback: Find the first format with a URL if format '18' wasn't found or didn't have a URL
      if (!selectedFormat) {
        selectedFormat = videoInfo.formats.find((f: any) => f.url);
      }
    } else {
      console.error("'formats' array not found in video info:", videoInfo);
      throw new Error("Could not find formats array in yt-dlp output.");
    }

    if (!selectedFormat) {
      console.error("Parsed video info (no suitable format found):", videoInfo);
      throw new Error(
        "No suitable format with a download URL found in yt-dlp output."
      );
    }

    console.log(
      "Selected format:",
      selectedFormat.format_id,
      selectedFormat.format_note || ""
    );

    // Extract necessary information from the selected format
    const downloadUrl = selectedFormat.url;
    const title = videoInfo.title || "video";
    // Use the extension from the selected format, fallback to mp4
    const ext = selectedFormat.ext || "mp4";
    const filename = `${title}.${ext}`.replace(/[/\\?%*:|"<>]/g, "-"); // Sanitize filename

    // We already checked for selectedFormat.url implicitly above, but a direct check is safer
    if (!downloadUrl) {
      console.error("Selected format missing URL:", selectedFormat);
      throw new Error("Selected format is missing the download URL.");
    }

    // Return the direct URL and suggested filename
    return NextResponse.json({ downloadUrl, filename });
  } catch (error) {
    console.error("API yt-dlp Download Error:", error);
    return NextResponse.json(
      {
        error: "Failed to get video info using yt-dlp",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

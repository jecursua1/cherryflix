"use client";

import { useRef } from "react";

export default function VideoPlayer({
  src,
  poster,
}: {
  src: string;
  poster?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      controls
      autoPlay
      playsInline
      className="h-full w-full bg-black"
    >
      Your browser does not support the video tag.
    </video>
  );
}

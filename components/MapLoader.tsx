"use client";

import dynamic from "next/dynamic";
import type { MapPin } from "./map-types";

const MapView = dynamic(() => import("./MapView").then((m) => m.MapView), {
  ssr: false,
  loading: () => (
    <div className="h-[360px] rounded border border-ink-500 bg-ink-700 flex items-center justify-center">
      <p className="label-eyebrow">Loading map…</p>
    </div>
  ),
});

export function MapLoader(props: {
  pins: MapPin[];
  center?: [number, number];
  zoom?: number;
  height?: number;
}) {
  return <MapView {...props} />;
}

export type { MapPin };

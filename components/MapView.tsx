"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type { MapPin } from "./map-types";

export type { MapPin };

const PIN_COLORS: Record<MapPin["kind"], string> = {
  last_seen: "#C23B3B",
  lead: "#E2A0A0",
  tip: "#5C8A6B",
};

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function MapView({
  pins,
  center,
  zoom = 12,
  height = 360,
}: {
  pins: MapPin[];
  center?: [number, number];
  zoom?: number;
  height?: number;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const markersRef = useRef<import("leaflet").Marker[]>([]);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);

  const fallbackCenter: [number, number] =
    center ||
    (pins.length
      ? [pins[0].lat, pins[0].lng]
      : [39.9612, -82.9988]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper || mapRef.current) return;

    let cancelled = false;

    void (async () => {
      const leaflet = await import("leaflet");
      if (cancelled || !wrapperRef.current) return;

      const L = leaflet.default;
      leafletRef.current = leaflet;

      wrapper.replaceChildren();
      const mapEl = document.createElement("div");
      mapEl.style.width = "100%";
      mapEl.style.height = "100%";
      wrapper.appendChild(mapEl);

      const map = L.map(mapEl, {
        center: fallbackCenter,
        zoom,
        scrollWheelZoom: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      mapRef.current = map;
      syncMarkers(L, map, markersRef.current, pins);
      syncView(L, map, pins, center, zoom);
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markersRef.current = [];
      wrapper.replaceChildren();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const L = leafletRef.current?.default;
    if (!map || !L) return;
    syncMarkers(L, map, markersRef.current, pins);
    syncView(L, map, pins, center, zoom);
  }, [pins, center, zoom]);

  return (
    <div
      ref={wrapperRef}
      style={{ height, width: "100%" }}
      className="rounded overflow-hidden border border-ink-500"
    />
  );
}

function makeIcon(L: typeof import("leaflet").default, color: string, size: number) {
  return L.divIcon({
    className: "",
    html: `<span style="display:block;width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid #EFE6D3;box-shadow:0 0 0 1px rgba(0,0,0,0.4)"></span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function syncMarkers(
  L: typeof import("leaflet").default,
  map: import("leaflet").Map,
  markers: import("leaflet").Marker[],
  pins: MapPin[]
) {
  markers.forEach((m) => m.remove());
  markers.length = 0;

  for (const pin of pins) {
    const size = pin.kind === "last_seen" ? 11 : 8;
    const marker = L.marker([pin.lat, pin.lng], {
      icon: makeIcon(L, PIN_COLORS[pin.kind], size),
    }).addTo(map);

    marker.bindPopup(
      `<div style="font-size:12px"><p style="font-weight:600;margin:0 0 2px">${escapeHtml(pin.label)}</p>${pin.detail
        ? `<p style="margin:0;color:#666">${escapeHtml(pin.detail)}</p>`
        : ""
      }</div>`
    );

    markers.push(marker);
  }
}

function syncView(
  L: typeof import("leaflet").default,
  map: import("leaflet").Map,
  pins: MapPin[],
  center: [number, number] | undefined,
  zoom: number
) {
  if (pins.length > 1) {
    map.fitBounds(
      L.latLngBounds(pins.map((p) => [p.lat, p.lng] as [number, number])),
      { padding: [30, 30] }
    );
  } else if (pins.length === 1) {
    map.setView([pins[0].lat, pins[0].lng], zoom);
  } else if (center) {
    map.setView(center, zoom);
  }
}

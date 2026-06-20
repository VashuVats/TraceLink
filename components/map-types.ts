export interface MapPin {
  id: string;
  lat: number;
  lng: number;
  label: string;
  detail?: string;
  kind: "last_seen" | "lead" | "tip";
}

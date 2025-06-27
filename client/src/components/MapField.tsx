"use client";
import React from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x.src ?? markerIcon2x,
  iconUrl: markerIcon.src ?? markerIcon,
  shadowUrl: markerShadow.src ?? markerShadow,
});
interface MapFieldProps {
  value: [number, number] | null;
  onChange: (coords: [number, number]) => void;
}

function LocationMarker({ value, onChange }: MapFieldProps) {
  useMapEvents({
    click(e: any) {
      onChange([e.latlng.lat, e.latlng.lng]);
    },
  });
  return value ? <Marker position={value} /> : null;
}

const MapField: React.FC<MapFieldProps> = ({ value, onChange }) => {
  return (
    <MapContainer
      center={value || [20, 77]}
      zoom={value ? 12 : 4}
      style={{ height: 300, width: "100%", borderRadius: 12, marginTop: 8 }}
      scrollWheelZoom={true}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <LocationMarker value={value} onChange={onChange} />
    </MapContainer>
  );
};

export default MapField;

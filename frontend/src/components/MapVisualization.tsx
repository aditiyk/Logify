import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Shipment, Disruption } from '../api';

// Fix leaflet icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Mock coords for India
const cityCoords: Record<string, [number, number]> = {
  "Mumbai": [19.0760, 72.8777],
  "Delhi": [28.7041, 77.1025],
  "Chennai": [13.0827, 80.2707],
  "Bangalore": [12.9716, 77.5946],
  "Kolkata": [22.5726, 88.3639],
  "Hyderabad": [17.3850, 78.4867],
  "Nhava Sheva Port": [18.9493, 72.9469],
  "Chennai Port": [13.0833, 80.2974],
  "Kolkata Port": [22.5458, 88.3184]
};

interface Props {
  shipment: Shipment | null;
  disruptions: Disruption[];
}

export default function MapVisualization({ shipment, disruptions }: Props) {
  const [center, setCenter] = useState<[number, number]>([20.5937, 78.9629]); // India center

  useEffect(() => {
    if (shipment && cityCoords[shipment.current_location]) {
      setCenter(cityCoords[shipment.current_location]);
    }
  }, [shipment]);

  return (
    <div className="w-full h-full min-h-[400px] rounded-xl overflow-hidden glass-panel relative z-0 border border-white/10">
      <style>{`
        .leaflet-layer,
        .leaflet-control-zoom-in,
        .leaflet-control-zoom-out,
        .leaflet-control-attribution {
          filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
        }
      `}</style>
      <MapContainer center={center} zoom={5} style={{ height: '100%', width: '100%', background: '#0B0B0F' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {shipment && (
          <>
            <Marker position={cityCoords[shipment.origin] || center}>
              <Popup>Origin: {shipment.origin}</Popup>
            </Marker>
            <Marker position={cityCoords[shipment.destination] || center}>
              <Popup>Destination: {shipment.destination}</Popup>
            </Marker>
            <Marker position={cityCoords[shipment.current_location] || center}>
              <Popup>Current: {shipment.current_location}<br/>Status: {shipment.current_status}</Popup>
            </Marker>
            {shipment.routes.filter(r => r.is_active).map((r, i) => (
               <Polyline key={i} positions={[
                 cityCoords[shipment.origin] || center,
                 cityCoords[shipment.current_location] || center,
                 cityCoords[shipment.destination] || center
               ]} color="#7C3AED" weight={4} opacity={0.8} />
            ))}
          </>
        )}

        {disruptions.map(d => (
          cityCoords[d.location] && (
            <Marker key={d.id} position={cityCoords[d.location]}>
              <Popup>
                <div className="text-red-500 font-bold mb-1">⚠️ Disruption at {d.location}</div>
                <div className="text-sm">{d.description}</div>
                <div className="text-sm font-medium mt-1">Delay: {d.delay_days} days</div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
    </div>
  );
}

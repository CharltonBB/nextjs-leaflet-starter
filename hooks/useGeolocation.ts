'use client';

import { useState, useCallback } from 'react';
import { useLeafletMap } from './useLeafletMap';

/**
 * Custom hook for geolocation functionality
 * 
 * Provides a reusable way to locate user's position on the map
 * and add a marker at their location.
 * 
 * @returns Object with locate function and loading state
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { locateUser, isLocating } = useGeolocation();
 *   
 *   return (
 *     <button onClick={locateUser} disabled={isLocating}>
 *       {isLocating ? 'Locating...' : 'Find Me'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useGeolocation() {
  const map = useLeafletMap();
  const [isLocating, setIsLocating] = useState(false);

  const locateUser = useCallback(() => {
    if (!map) {
      console.warn('Map instance not available');
      return;
    }

    setIsLocating(true);

    // Request user's location
    map.locate({ setView: true, maxZoom: 16 });

    // Handle successful location
    map.once('locationfound', (e) => {
      setIsLocating(false);

      // Dynamically import Leaflet to add markers
      import('leaflet').then((L) => {
        // Add accuracy circle
        L.circle(e.latlng, {
          radius: e.accuracy / 2,
          color: '#3b82f6',
          fillColor: '#3b82f6',
          fillOpacity: 0.2,
        }).addTo(map);

        // Add location marker
        L.marker(e.latlng, {
          icon: L.divIcon({
            className: 'custom-location-marker',
            html: `<div style="width: 16px; height: 16px; background: #3b82f6; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8],
          }),
        }).addTo(map);
      });
    });

    // Handle location error
    map.once('locationerror', (e) => {
      setIsLocating(false);
      console.error('Location error:', e.message);
      alert(
        'Unable to find your location. Please check your browser permissions.'
      );
    });
  }, [map]);

  return {
    locateUser,
    isLocating,
    isAvailable: !!map,
  };
}

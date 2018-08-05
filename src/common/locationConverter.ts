import LatLng = google.maps.LatLng;


export const locationToLatLng = (location: {latitude: number, longitude: number}): {lat: number, lng: number} => ({
    lat: location.latitude,
    lng: location.longitude
});

export const latLngToLocation = (latLng: LatLng): {latitude: number, longitude: number} => ({
    latitude: latLng.lat(),
    longitude: latLng.lng()
});
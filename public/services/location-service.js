export class LocationService {
  static async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
          resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        }, (err) => {
          resolve({ lat: 0, lng: 0 });
        }, { timeout: 5000 });
      } else {
        // Fallback mock
        resolve({ lat: 0, lng: 0 });
      }
    });
  }
}

export const locationService = LocationService;

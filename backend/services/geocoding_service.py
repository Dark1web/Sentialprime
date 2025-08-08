from geopy.geocoders import Nominatim

class GeocodingService:
    def __init__(self):
        self.geolocator = Nominatim(user_agent="sentinelx")

    def geocode(self, address):
        try:
            location = self.geolocator.geocode(address)
            if location:
                return {
                    "latitude": location.latitude,
                    "longitude": location.longitude,
                    "address": location.address,
                }
            return None
        except Exception as e:
            print(f"Error geocoding address: {e}")
            return None

    def reverse_geocode(self, lat, lon):
        try:
            location = self.geolocator.reverse((lat, lon))
            if location:
                return {
                    "latitude": location.latitude,
                    "longitude": location.longitude,
                    "address": location.address,
                }
            return None
        except Exception as e:
            print(f"Error reverse geocoding coordinates: {e}")
            return None

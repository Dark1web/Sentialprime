from sentinelhub import SHConfig, SentinelHubRequest, MimeType, CRS, BBox, DataCollection, Geometry
from datetime import datetime, timedelta
import asyncio
import base64
import numpy as np
from PIL import Image
import io

def get_bbox_from_coords(lat, lng, bbox_size_m):
    """
    Calculates a bounding box of a given size centered at given coordinates.
    bbox_size_m: size of the bounding box in meters.
    """
    # Simple conversion: 1 degree of latitude is approx 111km
    lat_span = bbox_size_m / 111000.0
    # Longitude span depends on latitude
    lng_span = bbox_size_m / (111000.0 * np.cos(np.radians(lat)))

    min_lat, max_lat = lat - lat_span / 2, lat + lat_span / 2
    min_lng, max_lng = lng - lng_span / 2, lng + lng_span / 2
    
    return BBox([min_lng, min_lat, max_lng, max_lat], crs=CRS.WGS84)

EVALSCRIPTS = {
    "true_color": """
        //VERSION=3
        function setup() {
            return {
                input: ["B02", "B03", "B04"],
                output: { bands: 3 }
            };
        }

        function evaluatePixel(sample) {
            return [2.5 * sample.B04, 2.5 * sample.B03, 2.5 * sample.B02];
        }
    """,
    "flood": """
        //VERSION=3
        // Simple flood detection script
        function setup() {
            return {
                input: ["B03", "B08"], // Green and NIR bands
                output: { bands: 3 }
            };
        }
        function evaluatePixel(sample) {
            let ndwi = (sample.B03 - sample.B08) / (sample.B03 + sample.B08);
            // Water will be blue, non-water will be grayscale
            if (ndwi > 0.2) {
                return [0.1, 0.2, 0.8]; // Blue for water
            }
            return [sample.B03 * 2.5, sample.B03 * 2.5, sample.B03 * 2.5];
        }
    """
}

class SentinelHubService:
    def __init__(self):
        self.config = SHConfig()
        self.config.sh_client_id = 'a7ddc3ce-4831-4730-9008-a99089576258'
        # You need to add your client secret. I will leave it as a placeholder for now.
        self.config.sh_client_secret = 'your_client_secret'
        self.config.sh_token_url = "https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token"
    
    def _get_satellite_image_data(self, bbox, time_interval, evalscript):
        """
        Synchronous method to fetch data.
        """
        try:
            request = SentinelHubRequest(
                evalscript=evalscript,
                input_data=[
                    SentinelHubRequest.input_data(
                        data_collection=DataCollection.SENTINEL2_L1C,
                        time_interval=time_interval,
                    )
                ],
                responses=[
                    SentinelHubRequest.output_response('default', MimeType.PNG)
                ],
                bbox=bbox,
                size=[512, 512],
                config=self.config
            )
            return request.get_data()[0]
        except Exception as e:
            print(f"Error fetching satellite image: {e}")
            return None

    async def get_disaster_imagery(self, lat: float, lng: float, disaster_type: str, bbox_size: float = 1000, time_range_days: int = 7):
        """
        Asynchronously gets satellite imagery for a disaster.
        """
        bbox = get_bbox_from_coords(lat, lng, bbox_size)
        
        end_time = datetime.now()
        start_time = end_time - timedelta(days=time_range_days)
        time_interval = (start_time.strftime('%Y-%m-%d'), end_time.strftime('%Y-%m-%d'))
        
        evalscript = EVALSCRIPTS.get(disaster_type, EVALSCRIPTS["true_color"])

        # Run the synchronous blocking call in a separate thread
        image_data_np = await asyncio.to_thread(
            self._get_satellite_image_data, bbox, time_interval, evalscript
        )

        if image_data_np is not None:
            # Convert numpy array to a PNG image, then to base64
            img = Image.fromarray(image_data_np)
            buffered = io.BytesIO()
            img.save(buffered, format="PNG")
            img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
            return f"data:image/png;base64,{img_str}"
        
        return None

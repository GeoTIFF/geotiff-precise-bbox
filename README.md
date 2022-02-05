# geotiff-bbox
Get the Most Precise Bounding Box for a GeoTIFF.  Avoid Floating Point Arithmetic Issues.

# install
```bash
npm install geotiff-precise-bbox
```

# usage
```js
import { fromURL } from "geotiff";
import getPreciseBoundingBox from "geotiff-precise-bbox";

const url = "https://raw.githubusercontent.com/GeoTIFF/test-data/master/files/eu_pasture.tiff";
const tif = await fromURL(url);
const image = await tif.getImage();
image.getBoundingBox();
[-31.456975828130908, 27.635001972364492, 40.20531917186909, 80.7984254723645]

getPreciseBoundingBox(image)
["-31.456975828130908", "27.6350019723645", "40.205319171869092", "80.7984254723645"]
```
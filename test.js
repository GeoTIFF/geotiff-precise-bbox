const test = require("flug");
const findAndRead = require("find-and-read");
const GeoTIFF = require("geotiff");
const toab = require("toab");
const { divide, subtract } = require("preciso");

const tests = require("./tests.json");
const getPreciseBoundingBox = require("./geotiff-precise-bbox.js");

async function loadImage(filename) {
  const buf = await findAndRead(filename);
  const ab = await toab(buf);
  const tif = await GeoTIFF.fromArrayBuffer(ab);
  return tif.getImage();
}

async function loadImageFromURL(url) {
  const tif = await GeoTIFF.fromUrl(url);
  return tif.getImage();
}

tests
  .filter(t => !t.skip)
  .forEach(({ filename, url, bbox: expected_bbox, precise_bbox: expected_precise_bbox }) => {
    test(filename || url, async ({ eq }) => {
      let image;
      if (filename) image = await loadImage(filename);
      else if (url) image = await loadImageFromURL(url);

      const actual_bbox = image.getBoundingBox();
      const actual_precise_bbox = getPreciseBoundingBox(image);
      eq(actual_bbox, expected_bbox);
      eq(actual_precise_bbox, expected_precise_bbox);

      const [xScale, yScale, zScale] = image.getResolution();
      const pixel_width = Math.abs(xScale);
      const pixel_height = Math.abs(yScale);

      if (image.fileDirectory?.ModelTransformation) return; // probably skewed or rotated

      // reverse and get pixel height and width from getPreciseBoundingBox(image)
      const [precise_xmin, precise_ymin, precise_xmax, precise_ymax] = actual_precise_bbox;
      const precise_pixel_width = Number(divide(subtract(precise_xmax, precise_xmin), image.getWidth().toString()));
      const precise_pixel_height = Number(divide(subtract(precise_ymax, precise_ymin), image.getHeight().toString()));
      eq(precise_pixel_height, pixel_height);
      eq(precise_pixel_width, pixel_width);

      // reverse engineer pixel width and height from image.getBoundingBox()
      const [xmin, ymin, xmax, ymax] = actual_bbox;
      const wpx = Number(divide(subtract(xmax.toString(), xmin.toString()), image.getWidth().toString()));
      const hpx = Number(divide(subtract(ymax.toString(), ymin.toString()), image.getHeight().toString()));
      if (hpx !== pixel_height) console.log(`[${filename}] pixel height should be ${pixel_height} not ${hpx}`);
      if (wpx !== pixel_width) console.log(`[${filename}] pixel width should be ${pixel_width} not ${wpx}`);
    });
  });

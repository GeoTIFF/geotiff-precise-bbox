const add = require("preciso/add.js");
const max = require("preciso/max.js");
const min = require("preciso/min.js");
const multiply = require("preciso/multiply.js");

function getPreciseBoundingBox(image) {
  const origin = image.getOrigin();
  if (!origin) throw new Error("[geotiff-bbox] failed to get origin");
  const resolution = image.getResolution();
  if (!origin) throw new Error("[geotiff-bbox] failed to get resolution");

  const x1 = origin[0].toString();
  const y1 = origin[1].toString();

  const x2 = add(x1, multiply(resolution[0].toString(), image.getWidth().toString()));
  const y2 = add(y1, multiply(resolution[1].toString(), image.getHeight().toString()));

  return [min(x1, x2), min(y1, y2), max(x1, x2), max(y1, y2)];
}

if (typeof define === "function" && define.amd)
  define(function () {
    return getPreciseBoundingBox;
  });
if (typeof module === "object") {
  module.exports = getPreciseBoundingBox;
  module.exports.default = getPreciseBoundingBox;
}
if (typeof window === "object") window.getPreciseBoundingBox = getPreciseBoundingBox;
if (typeof self === "object") self.getPreciseBoundingBox = getPreciseBoundingBox;

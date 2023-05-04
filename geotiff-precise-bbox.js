const add = require("preciso/add.js");
const max = require("preciso/max.js");
const min = require("preciso/min.js");
const multiply = require("preciso/multiply.js");
const subtract = require("preciso/subtract.js");
const sum = require("preciso/sum.js");

function getPreciseBoundingBox(image, { debug = false } = { debug: false }) {
  const fd = image.fileDirectory;

  if (fd.ModelPixelScale) {
    // https://www.awaresystems.be/imaging/tiff/tifftags/modelpixelscaletag.html
    const [ScaleX, ScaleY, ScaleZ] = fd.ModelPixelScale;

    // https://www.awaresystems.be/imaging/tiff/tifftags/modeltiepointtag.html
    const [I, J, K, X, Y, Z] = fd.ModelTiepoint;

    const x1 = X.toString();
    const y1 = Y.toString();

    const x2 = add(x1, multiply(ScaleX.toString(), image.getWidth().toString()));
    const y2 = subtract(y1, multiply(ScaleY.toString(), image.getHeight().toString()));

    return [min(x1, x2), min(y1, y2), max(x1, x2), max(y1, y2)];
  } else if (fd.ModelTransformation) {
    /* example:
    [
      -0.14299987236417117, -0.5767759114507439,  0,   337934.4836350695,
      -0.5767759114507457, 0.14299987236414916, 0,   7840518.464866471,
      0,                   0, 0,                   0,
      0,                   0, 0,                   1
    ]
    */
    // from https://github.com/OSGeo/libgeotiff/blob/0df4eea3522b22ea631a0fb2ffdd7c04b2fe07ea/geotiff/html/usgs_geotiff.html
    const [a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p] = fd.ModelTransformation;

    if (m !== 0) throw Error("unexpected m: " + m);
    if (n !== 0) throw Error("unexpected n: " + n);
    if (o !== 0) throw Error("unexpected o: " + o);
    if (p !== 1) throw Error("unexpected p:" + p);

    const width = image.getWidth().toString();
    const height = image.getHeight().toString();

    const corners = [
      ["0", "0"],
      ["0", height],
      [width, "0"],
      [width, height]
    ];

    const projected = corners.map(([I, J, K = 0]) => [
      sum([d.toString(), multiply(a.toString(), I), multiply(b.toString(), J), multiply(c.toString(), K)]),
      sum([h.toString(), multiply(e.toString(), I), multiply(f.toString(), J), multiply(g.toString(), K)])
    ]);

    const xs = projected.map(([x, y]) => x);
    const ys = projected.map(([x, y]) => y);

    return [min(xs), min(ys), max(xs), max(ys)];
  }
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

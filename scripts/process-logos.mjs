import sharp from "sharp";
import fs from "fs";

const outPublic = "public";
const outApp = "src/app";

// 1) Inspect the "flix" region colour
const { data, info } = await sharp("cherryflix-logo.png")
  .raw()
  .toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;
const sx = Math.floor(width * 0.82);
const sy = Math.floor(height * 0.55);
const si = (sy * width + sx) * channels;
console.log(
  `flix sample @(${sx},${sy}) rgba = ${data[si]},${data[si + 1]},${data[si + 2]},${data[si + 3]}`
);

// 2) Light version for dark backgrounds: recolour dark (navy "flix") pixels to
//    near-white, keep the red cherry + green leaves + red play button untouched.
const out = Buffer.from(data);
let recolored = 0;
for (let i = 0; i < out.length; i += channels) {
  const r = out[i],
    g = out[i + 1],
    b = out[i + 2],
    a = out[i + 3];
  if (a > 10 && Math.max(r, g, b) < 95) {
    out[i] = 245;
    out[i + 1] = 245;
    out[i + 2] = 245;
    recolored++;
  }
}
await sharp(out, { raw: { width, height, channels } })
  .png()
  .toFile(`${outPublic}/cherryflix-logo-light.png`);
console.log(`wrote cherryflix-logo-light.png (recolored ${recolored} px)`);

// 3) Keep the original logo available too (for light contexts)
fs.copyFileSync("cherryflix-logo.png", `${outPublic}/cherryflix-logo.png`);

// 4) Favicon / app icons from the cherry mark
await sharp("cherryflix-favicon.png").resize(512, 512).png().toFile(`${outApp}/icon.png`);
await sharp("cherryflix-favicon.png").resize(180, 180).png().toFile(`${outApp}/apple-icon.png`);
fs.copyFileSync("cherryflix-favicon.png", `${outPublic}/cherryflix-favicon.png`);
console.log("wrote app icon.png + apple-icon.png + public favicon");

// 5) Remove the default Next favicon so ours takes over
try {
  fs.unlinkSync(`${outApp}/favicon.ico`);
  console.log("removed default favicon.ico");
} catch {}
console.log("done");

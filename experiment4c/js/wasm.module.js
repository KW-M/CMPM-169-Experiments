import init from './rust-fft-2d/pkg/rust_fft_2d.js';
// import { memory } from "./rust-fft-2d/pkg/rust_fft_2d_bg.js";
import { Image } from './rust-fft-2d/pkg/rust_fft_2d.js';


// Rust Wasm Based on this tutorial: https://rustwasm.github.io/docs/book/game-of-life/implementing.html

/**
 *
 * @param {Number} width width of the image to create
 * @param {*} height height of the image to create
 * @param {*} pixels
 * @returns
 */
window.create2dfftImage = (width, height, pixels) => {
    const image = Image.new(width, height);
    const pixelsPtr = image.input_pixels_ptr();
    const pixelsWasmArray = new Uint8Array(wasm_memory.buffer, pixelsPtr, width * height);
    for (let i = 0; i < pixelsWasmArray.length; i++) {
        pixelsWasmArray[i] = pixels[i];
    }
    return image;
}

window.write2dfftImage = (image, width, height, pixels) => {
    const pixelsPtr = image.input_pixels_ptr();
    const pixelsWasmArray = new Uint8Array(wasm_memory.buffer, pixelsPtr, width * height);
    for (let i = 0; i < pixelsWasmArray.length; i++) {
        pixelsWasmArray[i] = pixels[i];
    }
    return image;
}

/**
 *
 * @param {Image} wasmImage
 * @param {Float64Array} pxlWeights
 * @returns {Image} the original image reference
 */
window.applyFFTAdjustmentWeights = (wasmImage, pxlWeights) => {
    const img = wasmImage;
    const weightsPtr = img.pix_adjustment_weight_ptr()
    const weightsWasmArray = new Float64Array(wasm_memory.buffer, weightsPtr, img.width() * img.height());
    for (let i = 0; i < weightsWasmArray.length; i++) {
        weightsWasmArray[i] = pxlWeights[i];
    }
    img.apply_adjustment_weights()
    return img;
}

/**
 * @param {Image} wasmImage
 * @returns {Uint8Array} the output pixels
 */
window.getPixels = (wasmImage) => {
    return new Uint8Array(wasm_memory.buffer, wasmImage.output_pixels_ptr(), wasmImage.width() * wasmImage.height());
}

/**
 * @param {Image} wasmImage
 * @returns {Uint8Array} the pixel offsets as set in the image
 */
window.offsetPxls = (wasmImage) => {
    let pxlFloats = new Float64Array(wasm_memory.buffer, wasmImage.pix_adjustment_weights(), wasmImage.width() * wasmImage.height());
    return new Uint8Array(pxlFloats.map((pxl) => (pxl) * 255));
}


window.initWasm = init;

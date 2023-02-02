import init from './rust-fft-2d/pkg/rust_fft_2d.js';
// import { memory } from "./rust-fft-2d/pkg/rust_fft_2d_bg.js";
import { Image } from './rust-fft-2d/pkg/rust_fft_2d.js';
// sketch.js - purpose and description here
// Author: Your Name
// Date: https://rustwasm.github.io/docs/book/game-of-life/implementing.html


window.create2dfftImage = (width, height, pixels) => {
    const image = Image.new(width, height);
    const pixelsPtr = image.pixels();
    const pixelsWasmArray = new Uint8Array(wasm_memory.buffer, pixelsPtr, width * height);
    for (let i = 0; i < pixelsWasmArray.length; i++) {
        pixelsWasmArray[i] = pixels[i];
    }
    return image;
}

// window.runFft = (wasmImage) => {
//     const img = wasmImage;
//     img.fft()
// }

// window.getMagPixels = (wasmImage) => {
//     const img = wasmImage;
//     img.fft()
//     img.ifft();
//     const logMaxMagnitude = img.fft_pixels_mag();
// }


window.applyFFTAdjustmentWeights = (wasmImage, pxlWeights) => {
    const img = wasmImage;
    const pixelsPtr = img.pix_adjustment_weights()
    const pixelsWasmArray = new Float64Array(wasm_memory.buffer, pixelsPtr, img.width() * img.height());
    for (let i = 0; i < pixelsWasmArray.length; i++) {
        pixelsWasmArray[i] = pxlWeights[i];
    }
    img.apply_adjustment_weights()
    return img;
}

window.runInverseFft = (wasmImage) => {
    const img = wasmImage;
    img.ifft();

    const pixelsArray = new Uint8Array(wasm_memory.buffer, img.pixels(), img.width() * img.height());
    return pixelsArray;
}


window.getPixels = (wasmImage) => {
    return new Uint8Array(wasm_memory.buffer, wasmImage.pixels(), wasmImage.width() * wasmImage.height());
}


window.offsetPxls = (wasmImage) => {
    let pxlFloats = new Float64Array(wasm_memory.buffer, wasmImage.pix_adjustment_weights(), wasmImage.width() * wasmImage.height());
    return new Uint8Array(pxlFloats.map((pxl) => (pxl) * 200));
}


window.initWasm = init;

mod utils;

// wasm-pack build --target web
use fft2d::slice::{fft_2d, fftshift, ifft_2d, ifftshift};
use wasm_bindgen::prelude::*;

// use image::GrayImage;
use rustfft::num_complex::Complex;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub fn greet() {
    alert("Hello, rust-fft-2d!");
}

#[wasm_bindgen]
pub struct Image {
    width: usize,
    height: usize,
    input_pixels: Vec<u8>,
    output_pixels: Vec<u8>,
    pixel_adjustment_weights: Vec<f64>,
    h_hats: Vec<Complex<f64>>,
}

#[wasm_bindgen]
impl Image {
    pub fn new(width: usize, height: usize) -> Image {
        Image {
            width,
            height,
            input_pixels: vec![0; width * height],
            output_pixels: vec![0; width * height],
            pixel_adjustment_weights: vec![1.0; width * height],
            h_hats: vec![Complex::new(0.0, 0.0); width * height],
        }
    }

    pub fn width(&self) -> usize {
        self.width
    }

    pub fn height(&self) -> usize {
        self.height
    }

    pub fn input_pixels_ptr(&self) -> *const u8 {
        self.input_pixels.as_ptr()
    }

    pub fn output_pixels_ptr(&self) -> *const u8 {
        self.output_pixels.as_ptr()
    }

    pub fn pix_adjustment_weight_ptr(&self) -> *const f64 {
        self.pixel_adjustment_weights.as_ptr()
    }

    pub fn apply_adjustment_weights(&mut self) {
        let mut i = 0;
        for x in self.h_hats.iter_mut() {
            let (r, theta) = x.to_polar();
            // let theta2 = theta * (self.pixel_adjustment_weights[i] as f64 / 25.0);
            // let r2 = r * (self.pixel_adjustment_weights[i] as f64 / 25.0 + 1.0);
            let theta2 = 0.0;
            let r2 =
                (self.pixel_adjustment_weights[i] / 25500.0 * (self.width * self.height) as f64);
            // let r2 = (self.width * self.height) as f64 / self.height as f64;
            *x = Complex::from_polar(r2, r2);
            i += 1;
        }

        // test:
        // for x in self.h_hats.iter_mut() {
        //     *x *= (i as f64 / 300.0).sin() * 0.5 + 1.0;
        //     i += 1;
        // }
    }

    pub fn fft(&mut self) {
        // Convert the image buffer to complex numbers to be able to compute the FFT.
        let mut img_buffer: Vec<Complex<f64>> = self
            .input_pixels
            .iter()
            .map(|&pix| Complex::new(pix as f64 / 255.0, 0.0))
            .collect();
        fft_2d(self.width as usize, self.height as usize, &mut img_buffer);
        img_buffer = fftshift(self.width as usize, self.height as usize, &img_buffer);
        self.h_hats = img_buffer;
    }

    pub fn ifft(&mut self) {
        // Convert the h_hats back to pixels.
        let mut img_buffer = ifftshift(self.width as usize, self.height as usize, &self.h_hats);
        ifft_2d(self.width as usize, self.height as usize, &mut img_buffer);

        // Normalize the data after FFT and IFFT.
        let fft_coef = 1.0 / (self.width * self.height) as f64;
        for x in img_buffer.iter_mut() {
            *x *= fft_coef;
        }

        // Convert the complex img_buffer back into a gray image.
        self.output_pixels = img_buffer
            .iter()
            .map(|c| (c.norm().min(1.0) * 255.0) as u8)
            .collect();
    }

    pub fn fft_pixels_mag(&mut self) -> f64 {
        let pixels: Vec<f64> = self
            .h_hats
            .iter()
            .map(|&imag| imag.norm_sqr().sqrt() as f64)
            .collect();
        let log_max: f64 = pixels
            .iter()
            .reduce(|acc, pix| return if *pix > *acc { pix } else { acc })
            .unwrap()
            .log2();
        self.output_pixels = pixels
            .iter()
            .map(|&pix| ((pix.log2() / log_max) as f64 * 255.0) as u8)
            .collect();
        return log_max;
        // self.pixels = self.pixels.iter().map(|&pix| (pix / 2) as u8).collect();
    }
}

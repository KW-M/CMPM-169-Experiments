/* tslint:disable */
/* eslint-disable */
/**
*/
export function greet(): void;
/**
*/
export class Image {
  free(): void;
/**
* @param {number} width
* @param {number} height
* @returns {Image}
*/
  static new(width: number, height: number): Image;
/**
* @returns {number}
*/
  width(): number;
/**
* @returns {number}
*/
  height(): number;
/**
* @returns {number}
*/
  input_pixels_ptr(): number;
/**
* @returns {number}
*/
  output_pixels_ptr(): number;
/**
* @returns {number}
*/
  pix_adjustment_weight_ptr(): number;
/**
*/
  apply_adjustment_weights(): void;
/**
* @param {number} which_hats
*/
  fft(which_hats: number): void;
/**
*/
  ifft(): void;
/**
* @returns {number}
*/
  fft_pixels_mag(): number;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_image_free: (a: number) => void;
  readonly image_new: (a: number, b: number) => number;
  readonly image_width: (a: number) => number;
  readonly image_height: (a: number) => number;
  readonly image_input_pixels_ptr: (a: number) => number;
  readonly image_output_pixels_ptr: (a: number) => number;
  readonly image_pix_adjustment_weight_ptr: (a: number) => number;
  readonly image_apply_adjustment_weights: (a: number) => void;
  readonly image_fft: (a: number, b: number) => void;
  readonly image_ifft: (a: number) => void;
  readonly image_fft_pixels_mag: (a: number) => number;
  readonly greet: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {SyncInitInput} module
*
* @returns {InitOutput}
*/
export function initSync(module: SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;

// From: https://codesandbox.io/s/p5js-typescript-4itvy?file=/global.d.ts:0-110
import "p5/global";

declare global {
    interface Window {
        draw: () => void;
        setup: () => void;
    }
}

// From: https://codesandbox.io/s/p5js-typescript-4itvy?file=/global.d.ts:0-110
import "p5/global";
import "p5/lib/addons/p5.sound";

declare global {
    interface Window {
        draw: () => void;
        setup: () => void;
    }
}

declare module 'vanta/dist/vanta.halo.min' {
  interface HaloOptions {
    THREE: typeof import('three');
    amplitudeFactor?: number;
    backgroundColor?: number;
    baseColor?: number;
    color2?: number;
    el: HTMLElement;
    mouseControls?: boolean;
    size?: number;
    speed?: number;
    touchControls?: boolean;
  }

  interface HaloEffect {
    destroy: () => void;
  }

  export default function HALO(options: HaloOptions): HaloEffect;
}

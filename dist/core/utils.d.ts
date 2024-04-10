export declare function rad2deg(rad: number): number;
export declare function deg2rad(deg: number): number;
export declare function fix2(v: number): number;
export declare function fix6(v: number): number;
export interface LinearCoordinates {
    x: number;
    y: number;
}
export interface PolarCoordinates {
    r: number;
    a: number;
}
export declare function linearToPolar(c: LinearCoordinates): PolarCoordinates;
export declare function polarToLinear(p: PolarCoordinates): LinearCoordinates;
export declare function downloadContent(content: string, filename: string): void;

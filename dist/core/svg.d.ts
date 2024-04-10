export declare function createSVGCircle(r: number): string;
export declare function createSVGgrid(sc: number, subd?: number, weight?: number): string;
declare type Point = {
    x: number;
    y: number;
};
declare type LineCoords = Point[];
export interface TextData {
    something: number;
    lines: LineCoords[];
}
export declare function makeText(txt: string, chs?: number): TextData;
export declare function getPrecisionPolarTextDXFLines(tdata: TextData, textB: number, pixH: number, sc: number): number[][][];
export declare function getPrecisionPolarTextSVG(tdata: TextData, textB: number, pixH: number, sc: number): string;
export declare function getPolarTextSVG(tdata: TextData, textB: number, pixH: number, sc: number): string;
export {};

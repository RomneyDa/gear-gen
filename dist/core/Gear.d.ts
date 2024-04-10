import { LinearCoordinates } from "./utils.js";
interface GearConstructor {
    id?: string;
    N?: number;
    D?: number;
    P?: number;
    PADeg?: number;
    parent?: Gear;
    jointAngleDeg?: number;
    internal?: boolean;
    internalThickness?: number;
    axleJoint?: boolean;
    layer?: number;
    scale?: number;
}
export declare class Gear {
    id: string;
    holeSize: number;
    crossSize: number;
    layer: number;
    constructor(props: GearConstructor);
    _N: number;
    get N(): number;
    set N(N: number);
    _D: number;
    get D(): number;
    set D(D: number);
    _PA: number;
    get PA(): number;
    set PA(PA: number);
    _jointAngle: number;
    get jointAngle(): number;
    get jointAngleDeg(): number;
    set jointAngle(jointAngle: number);
    _axleJoint: boolean;
    get axleJoint(): boolean;
    set axleJoint(axleJoint: boolean);
    _internal: boolean;
    get internal(): boolean;
    set internal(internal: boolean);
    _internalThickness: number;
    get internalThickness(): number;
    set internalThickness(thickness: number);
    /**
     * Get this gear's parent
     * @type {Gear}
     * @returns {Gear}
     */
    _parent?: Gear;
    get parent(): Gear | undefined;
    /**
     * Set this gear's parent
     * @param {Gear} parent - the parent gear
     */
    set parent(parent: Gear | undefined);
    _scale: number;
    get scale(): number;
    set scale(scale: number);
    setND(N: number, D: number): void;
    setNP(N: number, P: number): void;
    setDP(D: number, P: number): void;
    get P(): number;
    get gearAngleDeg(): number;
    toothModule: number;
    toothGap: number;
    get dOuter(): number;
    get dInner(): number;
    get rOuter(): number;
    get rInner(): number;
    get dBase(): number;
    get rBase(): number;
    get r(): number;
    get rScaled(): number;
    get size(): number;
    baseAngle: number;
    updateBaseAngle(): void;
    /**
     * Generates a list of polar coordinates that trace the profile of the gear.
     * This is where the meat of the graphics generation is.
     * Used for both svg and dxf
     * @type {Array<{r: number, a: number}>}
     * @returns {Array<{r: number, a: number}>}
     */
    get pointsPolar(): any[];
    get pointsLinear(): LinearCoordinates[];
    get firstToothMarker(): {
        x: number;
        y: number;
        size: number;
    };
    get description(): string;
    get descriptionTextData(): {
        data: import("./svg.js").TextData;
        height: number;
        B: number;
    };
    svg: string;
    updateSVG(): void;
    dxf: string;
    updateDXF(): void;
    get isInternalLink(): boolean;
    get ratio(): number;
    rot: number;
    getRot(globalRot: number): number;
    getRotSafe(globalRot: number): number;
    x: number;
    y: number;
    svgOffsetX: number;
    svgOffsetY: number;
    get defaultPos(): number;
    get offsetX(): number;
    get offsetY(): number;
    updatePositions(): void;
    updateStatic(): void;
    get totalRatio(): number;
    /**
     * A descriptive string to be used as a filename for a gear's downloadable content
     * @type {string}
     */
    get fileName(): string;
    downloadSVG(): void;
    downloadDXF(): void;
}
export {};

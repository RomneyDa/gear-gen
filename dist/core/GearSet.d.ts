import { Gear } from "./Gear.js";
export declare class GearSet {
    gears: Gear[];
    constructor(gears: Gear[]);
    get dimensions(): {
        h: number;
        w: number;
    };
    downloadAllSVGs(padding?: number, angle?: number): void;
    checkGears(): void;
    checkParentCompatibility(gear: Gear): void;
    getRootGear(): void;
    getGear(id: string): Gear | undefined;
    getDirectChildren(id: string): void;
    getAllChildren(id: string): void;
}

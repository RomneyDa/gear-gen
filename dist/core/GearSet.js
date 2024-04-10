import { downloadContent, fix6 } from "./utils.js";
export class GearSet {
    constructor(gears) {
        this.gears = [];
        this.gears = gears;
    }
    get dimensions() {
        const yMax = Math.max(...this.gears.map(g => g.y + g.size / 2));
        let yMin = Math.min(...this.gears.map(g => g.y - g.size / 2));
        const xMax = Math.max(...this.gears.map(g => g.x + g.size / 2));
        let xMin = Math.min(...this.gears.map(g => g.x - g.size / 2));
        if (xMin < 0)
            xMin = 0;
        if (yMin < 0)
            yMin = 0;
        return { h: yMax - yMin, w: xMax - xMin };
    }
    downloadAllSVGs(padding = 0, angle = 0) {
        const dims = this.dimensions;
        const w = dims.w + padding * 2;
        const h = dims.h + padding * 2;
        let svg = `<svg version="1.2" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="${w}px" height="${h}px" viewBox="0 0 ${w} ${h}" xml:space="preserve">`;
        const sortedGears = [...this.gears].sort((a, b) => a.layer - b.layer);
        sortedGears.forEach(gear => {
            const x = gear.svgOffsetX + padding;
            const y = gear.svgOffsetY + padding;
            const rot = fix6(gear.getRotSafe(angle) + gear.baseAngle);
            svg += `<g transform="translate(${x} ${y}) rotate(${rot} ${gear.size / 2} ${gear.size / 2})">${gear.svg}</g>`;
        });
        svg += '</svg>';
        downloadContent(svg, "gg_gearset.svg");
    }
    checkGears() {
        // Check that there is only one root gear
        // Check that all other gears have a parent
        // Check that all children are compatible with their parents
    }
    checkParentCompatibility(gear) {
    }
    getRootGear() {
        // Find the gear with no parent
    }
    getGear(id) {
        var _a;
        return (_a = this.gears) === null || _a === void 0 ? void 0 : _a.find((gear) => gear.id === id);
    }
    getDirectChildren(id) {
    }
    getAllChildren(id) {
    }
}

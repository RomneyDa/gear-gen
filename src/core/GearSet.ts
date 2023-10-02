import { Gear } from "./Gear"
import { downloadContent, fix6 } from "./utils"

export class GearSet {
    gears: Gear[] = []
    constructor(gears: Gear[]) {
        this.gears = gears
    }
    get dimensions() {
        const yMax = Math.max(...this.gears.map(g => g.y + g.size / 2))
        let yMin = Math.min(...this.gears.map(g => g.y - g.size / 2))
        const xMax = Math.max(...this.gears.map(g => g.x + g.size / 2))
        let xMin = Math.min(...this.gears.map(g => g.x - g.size / 2))
        if (xMin < 0) xMin = 0
        if (yMin < 0) yMin = 0
        return { h: yMax - yMin, w: xMax - xMin }
    }
    downloadAllSVGs(padding: number = 0, angle: number = 0) {
        const dims = this.dimensions
        const w = dims.w + padding * 2
        const h = dims.h + padding * 2
        let svg = `<svg version="1.2" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="${w}px" height="${h}px" viewBox="0 0 ${w} ${h}" xml:space="preserve">`

        const sortedGears = [...this.gears].sort((a, b) => a.layer - b.layer)
        sortedGears.forEach(gear => {
            const x = gear.svgOffsetX + padding
            const y = gear.svgOffsetY + padding
            const rot = fix6(gear.getRotSafe(angle) + gear.baseAngle)
            svg += `<g transform="translate(${x} ${y}) rotate(${rot} ${gear.size / 2} ${gear.size / 2})">${gear.svg}</g>`
        })
        svg += '</svg>'
        downloadContent(svg, "gg_gearset.svg");
    }
}

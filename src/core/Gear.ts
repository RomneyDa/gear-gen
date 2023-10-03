import { createSVGCircle, getPrecisionPolarTextDXFLines, getPrecisionPolarTextSVG, makeText } from "./svg"
import { LinearCoordinates, deg2rad, downloadContent, fix2, fix6, linearToPolar, polarToLinear, rad2deg } from "./utils"
import DXFDrawing, { dxfp1, dxfp2 } from "./dxf"

interface GearConstructor {
    id?: string
    N?: number // Number of teeth
    D?: number // Pitch diameter
    P?: number // Pitch
    PADeg?: number // Pressure angle - DEGREES

    parent?: Gear, // Parent gear
    jointAngleDeg?: number // Parent joint angle

    internal?: boolean // Internal gear?
    internalThickness?: number // Internal gear thickness
    axleJoint?: boolean // Axle joint
    layer?: number // similar to z index, to force gears to show in a certain order
    scale?: number //
}

const gearDefaults = {
    D: 2,
    N: 12,
    PADeg: 27,
    scale: 100,
    jointAngleDeg: -60,
    axleJoint: false,
    internal: false,
    layer: 1,
    holeSize: 0.25,
    crossSize: 8,
    internalThicknessRatio: 0.5 // fraction of diameter
}

const fiveCharID = () => (Math.random() + 1).toString(36).toUpperCase().substring(7)
export class Gear {
    id: string
    holeSize: number = gearDefaults.holeSize
    crossSize: number = gearDefaults.crossSize
    layer: number

    constructor(props: GearConstructor) {
        const { id, parent, N, D, P, PADeg, jointAngleDeg = gearDefaults.jointAngleDeg, internal, axleJoint = gearDefaults.axleJoint, layer = gearDefaults.layer, internalThickness, scale } = props
        this.id = id || fiveCharID()
        this._parent = parent
        this.layer = layer
        this._jointAngle = deg2rad(jointAngleDeg)

        if (this.parent?.internal && internal === true) throw new Error("Two internal gears cannot mesh")
        this._internal = !!internal

        if (parent) {
            if (scale) throw new Error("Cannot set scale on child gear")
            this._scale = parent._scale
        } else {
            this._scale = scale || gearDefaults.scale
        }

        if (PADeg && (PADeg < 15 || PADeg > 35)) throw new Error("Pressure angle must be between 15 and 35 degrees")

        if (N && D && P) throw new Error("Too many params provided - N, D, P")

        this._axleJoint = axleJoint
        if (axleJoint) {
            if (!parent) throw new Error("Cannot set axleJoint on root gear")

            if (!PADeg) this._PA = parent._PA
            else this._PA = deg2rad(PADeg)

            // P = N/D
            // D = N/P
            // N = D*P
            if (N && P) {
                this._N = N
                this._D = N / P
            } else if (D && P) {
                this._D = D
                this._N = D * P
            } else if (N && D) {
                this._N = N
                this._D = D
            } else if (N) {
                this._N = N
                this._D = N / parent.P
            } else if (D) {
                this._D = D
                this._N = D * parent.P
            } else {
                throw new Error("Must provide a parent + N/D or N/P or D/P")
            }
        } else {
            if (parent && PADeg) throw new Error("Cannot set PA on child gear")
            else if (parent) this._PA = parent._PA
            else if (!PADeg) throw new Error("Must provide PA")
            else this._PA = deg2rad(PADeg)

            if ((parent && N && D) || (parent && P)) throw new Error("Too many params provided - parent + N/D or parent + P")
            if (parent && N) {
                this._N = N
                this._D = N / parent.P
            } else if (parent && D) {
                this._D = D
                this._N = D * parent.P
            }
            else if (N && P) {
                this._N = N
                this._D = N / P
            } else if (D && P) {
                this._D = D
                this._N = D * P
            } else if (N && D) {
                this._N = N
                this._D = D
            } else {
                throw new Error("Must provide a parent + N or D, or N/P or D/P")
            }
        }

        this._internalThickness = internalThickness || this.D * gearDefaults.internalThicknessRatio
        this.updateStatic()
    }


    // Number of teeth
    _N: number = gearDefaults.N
    get N() { return this._N }
    set N(N: number) {
        this._N = N
        this.updateStatic()
    }

    // Pitch diameter
    _D: number = gearDefaults.D
    get D() { return this._D }
    set D(D: number) {
        this._D = D
        this.updateStatic()
    }

    // Pressure angle
    _PA: number = deg2rad(gearDefaults.PADeg)
    get PA() { return this._PA }
    set PA(PA: number) {
        this._PA = PA
        this.updateStatic()
    }

    // Joint angle - angle between center of parent and center of this gear, Rad
    _jointAngle: number = deg2rad(gearDefaults.jointAngleDeg)
    get jointAngle() { return this._jointAngle }
    get jointAngleDeg() { return rad2deg(this._jointAngle) }
    set jointAngle(jointAngle: number) {
        this._jointAngle = jointAngle
        this.updateStatic()
    }

    // Axle joint?
    _axleJoint: boolean = gearDefaults.axleJoint
    get axleJoint() { return this._axleJoint }
    set axleJoint(axleJoint: boolean) {
        this._axleJoint = axleJoint
        this.updateStatic()
    }

    // Internal gear?
    _internal: boolean = gearDefaults.internal
    get internal() { return this._internal }
    set internal(internal: boolean) {
        this._internal = internal
        this.updateStatic()
    }
    _internalThickness: number = 0
    get internalThickness() {
        if (!this.internal) return 0
        return this._internalThickness
    }
    set internalThickness(thickness: number) {
        this._internalThickness = thickness
        this.updateStatic()
    }

    // Parent
    _parent?: Gear
    get parent() { return this._parent }
    set parent(parent: Gear | undefined) {
        this._parent = parent
        this.updateStatic()
    }

    // Scale
    _scale: number = 100
    get scale() { return this._scale }
    set scale(scale: number) {
        this._scale = scale
        this.updateStatic()
    }

    // Different ways to set N and D
    setND(N: number, D: number) {
        this._N = N
        this._D = D
        this.updateStatic()
    }
    setNP(N: number, P: number) {
        this._N = N
        this._D = N / P
        this.updateStatic()
    }
    setDP(D: number, P: number) {
        this._N = D / P
        this._D = D
        this.updateStatic()
    }

    get P() { return this.N / this.D }
    get gearAngleDeg() { return 360 / this.N }

    toothModule: number = 2 // TODO - make these parameters
    toothGap: number = 0.3
    get dOuter() { return (this.N + (this.internal ? this.toothModule + this.toothGap : this.toothModule)) / this.P }
    get dInner() { return (this.N - (this.internal ? this.toothModule : this.toothModule + this.toothGap)) / this.P }
    get rOuter() { return this.dOuter / 2 }
    get rInner() { return this.dInner / 2 }

    get dBase() { return this.D * Math.cos(this.PA) }
    get rBase() { return this.dBase / 2 }
    get r() { return this.D / 2 }
    get rScaled() { return this.r * this.scale }
    get size() {
        return Math.ceil(this.scale * (this.dOuter + this.internalThickness))
    }

    baseAngle: number = 0
    updateBaseAngle() {
        // update on N, D, PA, internal change
        let ac = 0
        const pt = (r: number, a: number) => ({ r, a })
        for (var i = 1, step = .1, first = true, fix = 0; i < 100; i += step) {
            var bpl = polarToLinear(pt(this.rBase, -i)) // Base point - linear
            let len = deg2rad(i * this.rBase)	//length
            let opl = polarToLinear(pt(len, -i + 90))	//add line
            let np = linearToPolar({ x: bpl.x + opl.x, y: bpl.y + opl.y });

            if (np.r >= this.rInner) {
                if (first) {
                    first = false;
                    step = (2 / this.N) * 10;
                }
                if (np.r < this.r) ac = np.a;
                if (np.r > this.rOuter) {
                    if (++fix < 10) {
                        i -= step;
                        step /= 2;
                        continue;
                    }
                    np.r = this.rOuter;
                    break;
                }
            }
        }
        this.baseAngle = ac
    }

    // Graphics
    get pointsPolar() {
        let ac = 0
        const pt = (r: number, a: number) => ({ r, a })
        const pts: Array<{ r: number, a: number }> = []
        const firstPoint = pt(this.rInner, 0)
        pts.push(firstPoint)
        for (var i = 1, step = .1, first = true, fix = 0; i < 100; i += step) {
            var bpl = polarToLinear(pt(this.rBase, -i)) // Base point - linear
            let len = deg2rad(i * this.rBase)	//length
            let opl = polarToLinear(pt(len, -i + 90))	//add line
            let np = linearToPolar({ x: bpl.x + opl.x, y: bpl.y + opl.y });

            if (np.r >= this.rInner) {
                if (first) {
                    first = false;
                    step = (2 / this.N) * 10;
                }
                if (np.r < this.r) ac = np.a;
                if (np.r > this.rOuter) {
                    if (++fix < 10) {
                        i -= step;
                        step /= 2;
                        continue;
                    }
                    np.r = this.rOuter;
                    pts.push(np);
                    break;
                }
                pts.push(np);
            }
        }
        let mirrorAngle = this.gearAngleDeg / 2 + 2 * ac
        let firstPointAngle = (this.gearAngleDeg - mirrorAngle) > 0 ? 0 : -(this.gearAngleDeg - mirrorAngle) / 2
        pts[0] = pt(this.rInner, firstPointAngle);			// fix first point a
        while (pts[pts.length - 1].a > mirrorAngle / 2) {
            pts.pop()
        }
        const firstHalf = [...pts]
        const firstTooth = [...firstHalf, ...firstHalf.map(p => (pt(p.r, mirrorAngle - p.a))).reverse()]
        const allTeethSections = Array.from(Array(this.N).keys()).map(toothN => firstTooth.map(p => (pt(p.r, p.a + this.gearAngleDeg * toothN))))
        const allTeeth = Array.prototype.concat.apply([], allTeethSections);
        allTeeth.push(firstPoint) // Might only be needed if internal
        return allTeeth
    }
    get pointsLinear() {
        return this.pointsPolar.map(polarToLinear)
    }
    get firstToothMarker() {
        const size = Math.PI / this.P / 8; // TODO - make this a parameter
        const position = polarToLinear({
            r: this.D / 2,
            a: this.baseAngle + (this.internal ? -1 : 1) * this.gearAngleDeg / 4
        })
        return {
            size,
            ...position
        }
    }
    get description() {
        return "*" + this.id + " N=" + this.N + " Pitch D=" + fix2(this.D) + " P=" + fix2(this.P) + " PA=" + fix2(this.PA)
    }
    get descriptionTextData() {
        const maxHeight = 0.03 // TODO make this a parameter
        const data = makeText(this.description, 2)
        let height = this.internal ? 1 : this.rInner / 42 // TODO - make this a parameter
        height = height > maxHeight ? maxHeight : height
        return {
            data,
            height,
            B: this.internal ? (this.dOuter / 2) + height * 9 : this.rInner - height * 10 // TODO - make this a parameter
        }
    }

    // SVG
    svg: string = ""
    updateSVG() {
        const s = this.size
        let svg = `<svg version="1.2" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="${s}px" height="${s}px" viewBox="${-s / 2} ${-s / 2} ${s} ${s}" overflow="scroll">`;

        // Main gear profile
        const pts = this.pointsLinear
        svg += `<path class="gear-profile" id="gear-${this.id}" fill="#ddd" stroke="#444" stroke-width="1" stroke-miterlimit="10"
            d="M${pts.map((pt: LinearCoordinates) => fix6(pt.x * this.scale) + ',' + fix6(pt.y * this.scale)).join(' ')}${this.internal ? createSVGCircle(this.size / 2) : ''}z"
        />`;

        const defaultStyle = 'stroke="#444" stroke-width="0.5" stroke-miterlimit="10"'
        if (!this.axleJoint) svg += `<g>
            <polyline class="gear-cross" ${defaultStyle} points="${this.crossSize},0 -${this.crossSize},0"/>
            <polyline class="gear-cross" ${defaultStyle} points="0,${this.crossSize} 0,-${this.crossSize}"/>
        </g>`

        const ft = this.firstToothMarker
        svg += `<circle class="gear-first-tooth-marker" fill="#c00" stroke="none" stroke-miterlimit="10" cx="${fix6(ft.x * this.scale)}" cy="${fix6(ft.y * this.scale)}" r="${fix6(ft.size * this.scale)}"/>`;

        const td = this.descriptionTextData
        // const textSVG = getPolarTextSVG(td.data, td.B, td.height, this.scale) // If less points are needed this text is less precise
        const textSVG = getPrecisionPolarTextSVG(td.data, td.B, td.height, this.scale)
        svg += textSVG

        if (this.holeSize) {
            svg += `<circle class="gear-hole" fill="none" stroke="#000" r="${fix2((this.holeSize / 2) * this.scale)}"/>`
        }

        // Gear guide circles
        svg += `<g class="gear-guides" opacity="0.3">
            <circle class="gear-guide-pitch" fill="none" stroke="#f00" stroke-miterlimit="10" r="${fix2((this.D / 2) * this.scale)}"/>
            <circle class="gear-guide-outer" fill="none" stroke="#aaa" stroke-miterlimit="10" stroke-dasharray="2,2" r="${fix2((this.dOuter / 2) * this.scale)}"/>
            <circle class="gear-guide-base" fill="none" stroke="#00f" stroke-miterlimit="10" stroke-dasharray="2,2" r="${fix2((this.dBase / 2) * this.scale)}"/>
        </g>`
        svg += '</svg>';
        this.svg = svg
    }

    dxf: string = ""
    updateDXF() {
        const DXF = new DXFDrawing()
        DXF.addLayer("gear", DXF.ACI.WHITE, "CONTINUOUS")
        DXF.addLayer("gear_texts", DXF.ACI.WHITE, "CONTINUOUS");
        DXF.addLayer("gear_guides", DXF.ACI.BLUE, "CONTINUOUS");
        DXF.setActiveLayer("gear")

        // print points
        const dsc = 1
        const pts = this.pointsLinear.map((pt: LinearCoordinates) => [fix6(pt.x * dsc), -fix6(pt.y * dsc)])

        DXF.drawPolyLine(pts);
        DXF.setActiveLayer("gear_guides");
        DXF.drawLine(.1 * dsc, 0, -.1 * dsc, 0).drawLine(0, .1 * dsc, 0, -.1 * dsc);

        // first tooth marker
        const ft = this.firstToothMarker
        DXF.drawCircle(fix6(ft.x * dsc), -fix6(ft.y * dsc), fix6(ft.size * dsc));

        // text on wheel
        DXF.setActiveLayer("gear_texts");
        const td = this.descriptionTextData
        const textLines = getPrecisionPolarTextDXFLines(td.data, td.B, td.height, dsc)
        textLines.forEach(line => DXF.drawPolyLine(line, false))
        DXF.setActiveLayer("gear_guides");

        DXF.drawCircle(0, 0, fix6((this.D / 2) * dsc));
        DXF.drawCircle(0, 0, fix6((this.dOuter / 2) * dsc));
        DXF.drawCircle(0, 0, fix6((this.dBase / 2) * dsc));

        this.dxf = DXF.toDxfString()
    }

    // Positioning properties
    get isInternalLink() {
        return this.parent ? (this.internal && !this.parent.internal || !this.internal && this.parent.internal) : false
    }

    // Rotation
    get ratio(): number {
        if (!this.parent) return 1
        return this.parent.N / this.N
    }
    // Get rotation - this only works if parent gear is rendered first
    rot: number = 0
    getRot(globalRot: number): number {
        const update = (rot: number) => {
            this.rot = rot
            return rot
        }
        const jA = this.jointAngleDeg
        if (!this.parent) return update(globalRot - jA)
        if (this.axleJoint) return update(this.parent.rot - jA)
        const ratioAdjustment = this.ratio * (this.parent.rot + jA)
        if (this.isInternalLink) return update(((this.N + this.parent.N) % 2 ? (180 / this.N) : 0) + ratioAdjustment - jA)
        return update(180 - ratioAdjustment - jA)
    }
    // Get rotation - this one works regardless of render order but causes recursive redundant calculations
    getRotSafe(globalRot: number): number {
        const jA = this.jointAngleDeg
        if (!this.parent) return globalRot - jA
        if (this.axleJoint) return this.parent.getRot(globalRot) - jA
        const ratioAdjustment = this.ratio * (this.parent.getRot(globalRot) + jA)
        if (this.isInternalLink) return ((this.N + this.parent.N) % 2 ? (180 / this.N) : 0) + ratioAdjustment - jA
        return 180 - ratioAdjustment - jA
    }

    // Position:
    // Update on parent, internal, scale, N, D, axlejoint, jointAngle
    x: number = 0
    y: number = 0
    svgOffsetX: number = 0
    svgOffsetY: number = 0
    get defaultPos() {
        return this.size * 0.5
    }
    get offsetX() {
        if (!this.parent || this.axleJoint) return 0
        if (this.isInternalLink) return Math.cos(this.jointAngle) * (this.rScaled - this.parent.rScaled)
        return Math.cos(this.jointAngle) * (this.parent.rScaled + this.rScaled)
    }
    get offsetY() {
        if (!this.parent || this.axleJoint) return 0
        if (this.isInternalLink) return -Math.sin(this.jointAngle) * (this.rScaled - this.parent.rScaled)
        return -Math.sin(this.jointAngle) * (this.parent.rScaled + this.rScaled)
    }
    updatePositions() {
        if (!this.parent) {
            this.x = this.defaultPos
            this.y = this.defaultPos
        } else {
            this.x = this.parent.x + this.offsetX
            this.y = this.parent.y + this.offsetY
        }
        this.svgOffsetX = fix2(this.x - this.size / 2)
        this.svgOffsetY = fix2(this.y - this.size / 2)
    }

    updateStatic() {
        this.updateBaseAngle()
        this.updatePositions()
        this.updateSVG()
        this.updateDXF()
    }

    // Just for info
    get parentId() {
        return this.parent?.id
    }
    get totalRatio(): number {
        if (!this.parent) return this.ratio
        if (this.axleJoint) return this.parent.totalRatio
        return this.parent.totalRatio * this.ratio
    }

    // Downloads
    get fileName() {
        return `gear N${this.N} D${fix2(this.D)} P${fix2(this.P)} PA${fix2(this.PA)} @${fix2(this.scale)}`
    }
    downloadSVG() {
        downloadContent(this.svg, this.fileName + ".svg")
    }
    downloadDXF() {
        downloadContent(dxfp1 + this.dxf + dxfp2, this.fileName + ".dxf")
    }

}


import { createSVGCircle, getPrecisionPolarTextDXFLines, getPrecisionPolarTextSVG, makeText } from "./svg.js";
import { deg2rad, downloadContent, fix2, fix6, linearToPolar, polarToLinear, rad2deg } from "./utils.js";
import DXFDrawing, { dxfp1, dxfp2 } from "./dxf.js";
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
};
const fiveCharID = () => (Math.random() + 1).toString(36).toUpperCase().substring(7);
export class Gear {
    constructor(props) {
        var _a;
        this.holeSize = gearDefaults.holeSize;
        this.crossSize = gearDefaults.crossSize;
        // Number of teeth
        this._N = gearDefaults.N;
        // Pitch diameter
        this._D = gearDefaults.D;
        // Pressure angle
        this._PA = deg2rad(gearDefaults.PADeg);
        // Joint angle - angle between center of parent and center of this gear, Rad
        this._jointAngle = deg2rad(gearDefaults.jointAngleDeg);
        // Axle joint?
        this._axleJoint = gearDefaults.axleJoint;
        // Internal gear?
        this._internal = gearDefaults.internal;
        this._internalThickness = 0;
        // Scale
        this._scale = 100;
        this.toothModule = 2; // TODO - make these parameters
        this.toothGap = 0.3;
        this.baseAngle = 0;
        // SVG
        this.svg = "";
        this.dxf = "";
        // Get rotation - this only works if parent gear is rendered first
        this.rot = 0;
        // Position:
        // Update on parent, internal, scale, N, D, axlejoint, jointAngle
        this.x = 0;
        this.y = 0;
        this.svgOffsetX = 0;
        this.svgOffsetY = 0;
        const { id, parent, N, D, P, PADeg, jointAngleDeg = gearDefaults.jointAngleDeg, internal, axleJoint = gearDefaults.axleJoint, layer = gearDefaults.layer, internalThickness, scale } = props;
        this.id = id || fiveCharID();
        this._parent = parent;
        this.layer = layer;
        this._jointAngle = deg2rad(jointAngleDeg);
        if (((_a = this.parent) === null || _a === void 0 ? void 0 : _a.internal) && internal === true)
            throw new Error("Two internal gears cannot mesh");
        this._internal = !!internal;
        if (parent) {
            if (scale)
                throw new Error("Cannot set scale on child gear");
            this._scale = parent._scale;
        }
        else {
            this._scale = scale || gearDefaults.scale;
        }
        if (PADeg && (PADeg < 15 || PADeg > 35))
            throw new Error("Pressure angle must be between 15 and 35 degrees");
        if (N && D && P)
            throw new Error("Too many params provided - N, D, P");
        this._axleJoint = axleJoint;
        if (axleJoint) {
            if (!parent)
                throw new Error("Cannot set axleJoint on root gear");
            if (!PADeg)
                this._PA = parent._PA;
            else
                this._PA = deg2rad(PADeg);
            // P = N/D
            // D = N/P
            // N = D*P
            if (N && P) {
                this._N = N;
                this._D = N / P;
            }
            else if (D && P) {
                this._D = D;
                this._N = D * P;
            }
            else if (N && D) {
                this._N = N;
                this._D = D;
            }
            else if (N) {
                this._N = N;
                this._D = N / parent.P;
            }
            else if (D) {
                this._D = D;
                this._N = D * parent.P;
            }
            else {
                throw new Error("Must provide a parent + N/D or N/P or D/P");
            }
        }
        else {
            if (parent) {
                if (PADeg)
                    throw new Error("Cannot set PA on non-axle-joint child gear");
                this._PA = parent._PA;
                if (P)
                    throw new Error("Cannot set diametrical pitch P on non-axle-joint child gear");
                if (N && D)
                    throw new Error("Too many params provided - can only provide number of teeth or diameter, since P is inherited");
                if (N) {
                    this._N = N;
                    this._D = N / parent.P;
                }
                else if (D) {
                    this._D = D;
                    this._N = D * parent.P;
                }
            }
            else {
                if (!PADeg)
                    this._PA = deg2rad(gearDefaults.PADeg);
                else
                    this._PA = deg2rad(PADeg);
                if (N && P) {
                    this._N = N;
                    this._D = N / P;
                }
                else if (D && P) {
                    this._D = D;
                    this._N = D * P;
                }
                else if (N && D) {
                    this._N = N;
                    this._D = D;
                }
                else {
                    throw new Error("If no parent is provided, must provide N+D, or N+P or D+P");
                }
            }
        }
        this._internalThickness = internalThickness || this.D * gearDefaults.internalThicknessRatio;
        this.updateStatic();
    }
    get N() { return this._N; }
    set N(N) {
        this._N = N;
        this.updateStatic();
    }
    get D() { return this._D; }
    set D(D) {
        this._D = D;
        this.updateStatic();
    }
    get PA() { return this._PA; }
    set PA(PA) {
        this._PA = PA;
        this.updateStatic();
    }
    get jointAngle() { return this._jointAngle; }
    get jointAngleDeg() { return rad2deg(this._jointAngle); }
    set jointAngle(jointAngle) {
        this._jointAngle = jointAngle;
        this.updateStatic();
    }
    get axleJoint() { return this._axleJoint; }
    set axleJoint(axleJoint) {
        this._axleJoint = axleJoint;
        this.updateStatic();
    }
    get internal() { return this._internal; }
    set internal(internal) {
        this._internal = internal;
        this.updateStatic();
    }
    get internalThickness() {
        if (!this.internal)
            return 0;
        return this._internalThickness;
    }
    set internalThickness(thickness) {
        this._internalThickness = thickness;
        this.updateStatic();
    }
    get parent() { return this._parent; }
    /**
     * Set this gear's parent
     * @param {Gear} parent - the parent gear
     */
    set parent(parent) {
        this._parent = parent;
        this.updateStatic();
    }
    get scale() { return this._scale; }
    set scale(scale) {
        this._scale = scale;
        this.updateStatic();
    }
    // Different ways to set N and D
    setND(N, D) {
        this._N = N;
        this._D = D;
        this.updateStatic();
    }
    setNP(N, P) {
        this._N = N;
        this._D = N / P;
        this.updateStatic();
    }
    setDP(D, P) {
        this._N = D / P;
        this._D = D;
        this.updateStatic();
    }
    get P() { return this.N / this.D; }
    get gearAngleDeg() { return 360 / this.N; }
    get dOuter() { return (this.N + (this.internal ? this.toothModule + this.toothGap : this.toothModule)) / this.P; }
    get dInner() { return (this.N - (this.internal ? this.toothModule : this.toothModule + this.toothGap)) / this.P; }
    get rOuter() { return this.dOuter / 2; }
    get rInner() { return this.dInner / 2; }
    get dBase() { return this.D * Math.cos(this.PA); }
    get rBase() { return this.dBase / 2; }
    get r() { return this.D / 2; }
    get rScaled() { return this.r * this.scale; }
    get size() {
        return Math.ceil(this.scale * (this.dOuter + this.internalThickness));
    }
    updateBaseAngle() {
        // update on N, D, PA, internal change
        let ac = 0;
        const pt = (r, a) => ({ r, a });
        for (var i = 1, step = .1, first = true, fix = 0; i < 100; i += step) {
            var bpl = polarToLinear(pt(this.rBase, -i)); // Base point - linear
            let len = deg2rad(i * this.rBase); //length
            let opl = polarToLinear(pt(len, -i + 90)); //add line
            let np = linearToPolar({ x: bpl.x + opl.x, y: bpl.y + opl.y });
            if (np.r >= this.rInner) {
                if (first) {
                    first = false;
                    step = (2 / this.N) * 10;
                }
                if (np.r < this.r)
                    ac = np.a;
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
        this.baseAngle = ac;
    }
    // Graphics
    /**
     * Generates a list of polar coordinates that trace the profile of the gear.
     * This is where the meat of the graphics generation is.
     * Used for both svg and dxf
     * @type {Array<{r: number, a: number}>}
     * @returns {Array<{r: number, a: number}>}
     */
    get pointsPolar() {
        let ac = 0;
        const pt = (r, a) => ({ r, a });
        const pts = [];
        const firstPoint = pt(this.rInner, 0);
        pts.push(firstPoint);
        for (var i = 1, step = .1, first = true, fix = 0; i < 100; i += step) {
            var bpl = polarToLinear(pt(this.rBase, -i)); // Base point - linear
            let len = deg2rad(i * this.rBase); //length
            let opl = polarToLinear(pt(len, -i + 90)); //add line
            let np = linearToPolar({ x: bpl.x + opl.x, y: bpl.y + opl.y });
            if (np.r >= this.rInner) {
                if (first) {
                    first = false;
                    step = (2 / this.N) * 10;
                }
                if (np.r < this.r)
                    ac = np.a;
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
        let mirrorAngle = this.gearAngleDeg / 2 + 2 * ac;
        let firstPointAngle = (this.gearAngleDeg - mirrorAngle) > 0 ? 0 : -(this.gearAngleDeg - mirrorAngle) / 2;
        pts[0] = pt(this.rInner, firstPointAngle); // fix first point a
        while (pts[pts.length - 1].a > mirrorAngle / 2) {
            pts.pop();
        }
        const firstHalf = [...pts];
        const firstTooth = [...firstHalf, ...firstHalf.map(p => (pt(p.r, mirrorAngle - p.a))).reverse()];
        const allTeethSections = Array.from(Array(this.N).keys()).map(toothN => firstTooth.map(p => (pt(p.r, p.a + this.gearAngleDeg * toothN))));
        const allTeeth = Array.prototype.concat.apply([], allTeethSections);
        allTeeth.push(firstPoint); // Might only be needed if internal
        return allTeeth;
    }
    get pointsLinear() {
        return this.pointsPolar.map(polarToLinear);
    }
    get firstToothMarker() {
        const size = Math.PI / this.P / 8; // TODO - make this a parameter
        const position = polarToLinear({
            r: this.D / 2,
            a: this.baseAngle + (this.internal ? -1 : 1) * this.gearAngleDeg / 4
        });
        return Object.assign({ size }, position);
    }
    get description() {
        return "*" + this.id + " N=" + this.N + " Pitch D=" + fix2(this.D) + " P=" + fix2(this.P) + " PA=" + fix2(this.PA);
    }
    get descriptionTextData() {
        const maxHeight = 0.03; // TODO make this a parameter
        const data = makeText(this.description, 2);
        let height = this.internal ? 1 : this.rInner / 42; // TODO - make this a parameter
        height = height > maxHeight ? maxHeight : height;
        return {
            data,
            height,
            B: this.internal ? (this.dOuter / 2) + height * 9 : this.rInner - height * 10 // TODO - make this a parameter
        };
    }
    updateSVG() {
        const s = this.size;
        let svg = `<svg version="1.2" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="${s}px" height="${s}px" viewBox="${-s / 2} ${-s / 2} ${s} ${s}" overflow="scroll">`;
        // Main gear profile
        const pts = this.pointsLinear;
        svg += `<path class="gear-profile" id="gear-${this.id}" fill="#ddd" stroke="#444" stroke-width="1" stroke-miterlimit="10"
            d="M${pts.map((pt) => fix6(pt.x * this.scale) + ',' + fix6(pt.y * this.scale)).join(' ')}${this.internal ? createSVGCircle(this.size / 2) : ''}z"
        />`;
        const defaultStyle = 'stroke="#444" stroke-width="0.5" stroke-miterlimit="10"';
        if (!this.axleJoint)
            svg += `<g>
            <polyline class="gear-cross" ${defaultStyle} points="${this.crossSize},0 -${this.crossSize},0"/>
            <polyline class="gear-cross" ${defaultStyle} points="0,${this.crossSize} 0,-${this.crossSize}"/>
        </g>`;
        const ft = this.firstToothMarker;
        svg += `<circle class="gear-first-tooth-marker" fill="#c00" stroke="none" stroke-miterlimit="10" cx="${fix6(ft.x * this.scale)}" cy="${fix6(ft.y * this.scale)}" r="${fix6(ft.size * this.scale)}"/>`;
        const td = this.descriptionTextData;
        // const textSVG = getPolarTextSVG(td.data, td.B, td.height, this.scale) // If less points are needed this text is less precise
        const textSVG = getPrecisionPolarTextSVG(td.data, td.B, td.height, this.scale);
        svg += textSVG;
        if (this.holeSize) {
            svg += `<circle class="gear-hole" fill="none" stroke="#000" r="${fix2((this.holeSize / 2) * this.scale)}"/>`;
        }
        // Gear guide circles
        svg += `<g class="gear-guides" opacity="0.3">
            <circle class="gear-guide-pitch" fill="none" stroke="#f00" stroke-miterlimit="10" r="${fix2((this.D / 2) * this.scale)}"/>
            <circle class="gear-guide-outer" fill="none" stroke="#aaa" stroke-miterlimit="10" stroke-dasharray="2,2" r="${fix2((this.dOuter / 2) * this.scale)}"/>
            <circle class="gear-guide-base" fill="none" stroke="#00f" stroke-miterlimit="10" stroke-dasharray="2,2" r="${fix2((this.dBase / 2) * this.scale)}"/>
        </g>`;
        svg += '</svg>';
        this.svg = svg;
    }
    updateDXF() {
        const DXF = new DXFDrawing();
        DXF.addLayer("gear", DXF.ACI.WHITE, "CONTINUOUS");
        DXF.addLayer("gear_texts", DXF.ACI.WHITE, "CONTINUOUS");
        DXF.addLayer("gear_guides", DXF.ACI.BLUE, "CONTINUOUS");
        DXF.setActiveLayer("gear");
        // print points
        const dsc = 1;
        const pts = this.pointsLinear.map((pt) => [fix6(pt.x * dsc), -fix6(pt.y * dsc)]);
        DXF.drawPolyLine(pts);
        DXF.setActiveLayer("gear_guides");
        DXF.drawLine(.1 * dsc, 0, -.1 * dsc, 0).drawLine(0, .1 * dsc, 0, -.1 * dsc);
        // first tooth marker
        const ft = this.firstToothMarker;
        DXF.drawCircle(fix6(ft.x * dsc), -fix6(ft.y * dsc), fix6(ft.size * dsc));
        // text on wheel
        DXF.setActiveLayer("gear_texts");
        const td = this.descriptionTextData;
        const textLines = getPrecisionPolarTextDXFLines(td.data, td.B, td.height, dsc);
        textLines.forEach(line => DXF.drawPolyLine(line, false));
        DXF.setActiveLayer("gear_guides");
        DXF.drawCircle(0, 0, fix6((this.D / 2) * dsc));
        DXF.drawCircle(0, 0, fix6((this.dOuter / 2) * dsc));
        DXF.drawCircle(0, 0, fix6((this.dBase / 2) * dsc));
        this.dxf = DXF.toDxfString();
    }
    // Positioning properties
    get isInternalLink() {
        return this.parent ? (this.internal && !this.parent.internal || !this.internal && this.parent.internal) : false;
    }
    // Rotation
    get ratio() {
        if (!this.parent)
            return 1;
        return this.parent.N / this.N;
    }
    getRot(globalRot) {
        const update = (rot) => {
            this.rot = rot;
            return rot;
        };
        const jA = this.jointAngleDeg;
        if (!this.parent)
            return update(globalRot - jA);
        if (this.axleJoint)
            return update(this.parent.rot - jA);
        const ratioAdjustment = this.ratio * (this.parent.rot + jA);
        if (this.isInternalLink)
            return update(((this.N + this.parent.N) % 2 ? (180 / this.N) : 0) + ratioAdjustment - jA);
        return update(180 - ratioAdjustment - jA);
    }
    // Get rotation - this one works regardless of render order but causes recursive redundant calculations
    getRotSafe(globalRot) {
        const jA = this.jointAngleDeg;
        if (!this.parent)
            return globalRot - jA;
        if (this.axleJoint)
            return this.parent.getRot(globalRot) - jA;
        const ratioAdjustment = this.ratio * (this.parent.getRot(globalRot) + jA);
        if (this.isInternalLink)
            return ((this.N + this.parent.N) % 2 ? (180 / this.N) : 0) + ratioAdjustment - jA;
        return 180 - ratioAdjustment - jA;
    }
    get defaultPos() {
        return this.size * 0.5;
    }
    get offsetX() {
        if (!this.parent || this.axleJoint)
            return 0;
        if (this.isInternalLink)
            return Math.cos(this.jointAngle) * (this.rScaled - this.parent.rScaled);
        return Math.cos(this.jointAngle) * (this.parent.rScaled + this.rScaled);
    }
    get offsetY() {
        if (!this.parent || this.axleJoint)
            return 0;
        if (this.isInternalLink)
            return -Math.sin(this.jointAngle) * (this.rScaled - this.parent.rScaled);
        return -Math.sin(this.jointAngle) * (this.parent.rScaled + this.rScaled);
    }
    updatePositions() {
        if (!this.parent) {
            this.x = this.defaultPos;
            this.y = this.defaultPos;
        }
        else {
            this.x = this.parent.x + this.offsetX;
            this.y = this.parent.y + this.offsetY;
        }
        this.svgOffsetX = fix2(this.x - this.size / 2);
        this.svgOffsetY = fix2(this.y - this.size / 2);
    }
    updateStatic() {
        this.updateBaseAngle();
        this.updatePositions();
        this.updateSVG();
        this.updateDXF();
    }
    // Just for info
    get totalRatio() {
        if (!this.parent)
            return this.ratio;
        if (this.axleJoint)
            return this.parent.totalRatio;
        return this.parent.totalRatio * this.ratio;
    }
    // Downloads
    /**
     * A descriptive string to be used as a filename for a gear's downloadable content
     * @type {string}
     */
    get fileName() {
        return `gear N${this.N} D${fix2(this.D)} P${fix2(this.P)} PA${fix2(this.PA)} @${fix2(this.scale)}`;
    }
    downloadSVG() {
        downloadContent(this.svg, this.fileName + ".svg");
    }
    downloadDXF() {
        downloadContent(dxfp1 + this.dxf + dxfp2, this.fileName + ".dxf");
    }
}

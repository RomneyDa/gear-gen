import { fix2, fix6, polarToLinear } from "./utils";

export function createSVGCircle(r: number) {
    return "M-" + r + ",0a" + r + "," + r + ",0 0,1 " + (2 * r) + ",0a " + r + "," + r + " 0 0,1 -" + (2 * r) + ",0z";
}

export function createSVGgrid(sc: number, subd: number = 10, weight: number = 1) { // og colors: ["#888", "#fff", "#888"]
    const scdot = sc + 0.5;
    let out = '<svg version="1.2" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="' + sc + 'px" height="' + sc + 'px" viewBox="0 0 ' + sc + ' ' + sc + '" xml:space="preserve">';	//+out+'</svg>';

    out += '<g class="grid" stroke="#888" opacity="0.2">'
    out += '<polyline class="grid-line grid-line-major" fill="none" stroke-width="' + weight + '" stroke-linecap="square" stroke-miterlimit="2"  points="';
    out += '0.5 ' + scdot + ' 0.5 0.5 ' + scdot + ' 0.5"></polyline>';

    for (var i = 1; i < subd; i++) {
        var pos = (sc / subd) * i + 0.5;
        out += '<polyline class="grid-line grid-line-minor grid-line-minor-horizontal" fill="none" stroke-width="' + (weight / 2) + '" stroke-linecap="square" stroke-miterlimit="2"  points="0.5 ' + pos + ' ' + scdot + ' ' + pos + '"></polyline>';
        out += '<polyline class="grid-line grid-line-minor grid-line-minor-vertical" fill="none" stroke-width="' + (weight / 2) + '" stroke-linecap="square" stroke-miterlimit="2"  points="' + pos + ' 0.5 ' + pos + ' ' + scdot + '"></polyline>';
    }

    out += '</g></svg>';
    return out;
}

const font = ["ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-/=*;:,.<>", "0204284442324335464738181215080307480525452224683316263634174130100106373120004014232713", "4ABCDE/BD 4AFGDHIJKLM/NH/OL 4GFMPQLKJ 4AFGJKO/LM 4EAOR/ST 4AOR/ST 4HUEMPQLR 4ER/US/OA 2VA/ML/CO 4RGFMP 4ENR/AO/NS 4EAO 4ERWOA 4REOA 4UGFMPQLKJU 4SHIJKOA 4DVMPQLKJD 4ENHIJKOA/NS 4JKLQGFMP 4RO/CV 4RGFMPO 6XFO 6XEHVO 4RA/EO 4RTO/TV 4EARO 4YVMPSZaHYE 4OBabUGFVBA 4EMPSZI 4EDVMPSZaDR 4FMPSZbUcB 4MdCKJ/HS 4EMPSZbUefgh 4BabUE/AO 0Ai/QO 3Kj/bklgh 4EWI/AO/WB 1MPO 4Ai/SZTbUE/WT 4Ai/BabUE 4GFMPSZbUG 4mi/SZbUGFA 4nI/EMPSZbU 4Ai/BabU 4IZSocGFA 4GFpC/Ii 4IE/DVMPi 4IVi 4IFaMi 4IA/Ei 4Igm/Vi 4EAIi 3YVMPQLCjY 2QLM/VA 4EABNHIJKLQ 4QLKJIHDGFMP/TH 4DBKF 4ROibUGFMP 4SHDGFMPiCK 4ORV 4NBPMFGDHNiQLKJIH 4UNiQLKJDVM 4pq/US 4US 4RA 4Ii/DB 4US/pq/JP/GQ 1ZN/oMh 1ZN/or 1rMh 0PA 3KSF 3OHA"]
function getASCIIndex(code: number) {
    let movedCode = code - 65
    if (movedCode > 25) movedCode -= 6
    return movedCode * 2
}
interface CharData {
    type: number
    data: Array<Array<string>>
}
function getchardata(chr: string): CharData {
    // Given a character, 
    // This returns an array of numbers
    var i = font[0].lastIndexOf(chr)
    if (i === -1) return {
        type: (chr === " " ? 3 : -1),
        data: []
    }
    var chdata = font[2].split(" ")[i]
    const type = Number(chdata.substr(0, 1))
    const data: Array<Array<string>> = [];
    let line = 0
    for (var p = 0; p < chdata.length; p++) {
        if (!data[line]) data[line] = []
        var pi = getASCIIndex(chdata.charCodeAt(p));
        if (pi < 0) {
            if (data[0].length) line++
        }
        else data[line].push(font[1].substr(pi, 2));
    }
    return {
        type,
        data
    }
}
type Point = { x: number, y: number }
type LineCoords = Point[]
interface TextData {
    something: number
    lines: LineCoords[]
}
export function makeText(txt: string, chs: number = 1): TextData {
    let pos = 0
    const lines: LineCoords[] = [];
    for (let i = 0; i < txt.length; i++) {
        const cdata = getchardata(txt.substr(i, 1));
        if (cdata.type >= 0) {
            for (let l = 0; l < cdata.data.length; l++) {
                const line: LineCoords = [];
                for (var p = 0; p < cdata.data[l].length; p++) {
                    const pt: string[] = cdata.data[l][p].split("");
                    line.push({ x: Number(pt[0]) + pos, y: Number(pt[1]) });
                }
                lines.push(line);
            }
            pos += chs + cdata.type;
        }
    }
    if (pos > 0) pos = pos - 1;
    return { something: pos, lines: lines };
}

function getPrecisionPolarTextLines(tdata: TextData, textB: number, pixH: number) {
    const plotAngle = pixH * 180 / (textB * Math.PI)
    const angularLength = tdata.something * plotAngle // angular length of the text
    const ba = angularLength / 2 // base angle
    const lines: Array<LineCoords> = []
    tdata.lines.forEach(line => {
        const points: Array<Point> = []
        let lx = 0, ly = 0, a, r, dx
        line.forEach((pt, index) => {
            if (index === 0) {
                lx = pt.x;
                ly = pt.y
                a = -lx * plotAngle + ba;
                r = (ly - 5) * pixH + textB;
                points.push(polarToLinear({ r, a }))
            } else {
                dx = Math.abs(pt.x - lx);
                if (dx === 0) dx = 1
                const ix = (pt.x - lx) / dx;
                const iy = (pt.y - ly) / dx;
                for (var s = 1; s <= dx; s++) {
                    let Y = ly + iy * s;
                    let X = lx + ix * s;
                    a = -X * plotAngle + ba;
                    r = (Y - 5) * pixH + textB;
                    points.push(polarToLinear({ r, a }))
                }
                lx = pt.x;
                ly = pt.y;
            }
        })
        lines.push(points)
    })
    return lines
}
export function getPrecisionPolarTextDXFLines(tdata: TextData, textB: number, pixH: number, sc: number) {
    const linesPolar = getPrecisionPolarTextLines(tdata, textB, pixH)
    const linesLinear = linesPolar.map(line => line.map(pt => [fix6(pt.x * sc), -fix6(pt.y * sc)]))
    return linesLinear
}
export function getPrecisionPolarTextSVG(tdata: TextData, textB: number, pixH: number, sc: number) {
    const linesPolar = getPrecisionPolarTextLines(tdata, textB, pixH)
    const linesLinear = linesPolar.map(group => group.map(pt => [fix2(pt.x * sc), fix2(pt.y * sc)]))
    let out = '<g class="gear-text-container">'
    linesLinear.forEach(line => {
        out += '<polyline class="gear-text" fill="none" stroke="#444" stroke-width="0.5" stroke-linecap="square" stroke-miterlimit="1"  points="'
        line.forEach(pt => {
            out += pt[0] + " " + pt[1] + " ";
        })
        out += '"/>';
    })
    out += "</g>"
    return out
}

export function getPolarTextSVG(tdata: TextData, textB: number, pixH: number, sc: number) {
    const plotAngle = 180 / ((textB * Math.PI) / pixH)
    var angularLength = tdata.something * plotAngle // angular length of the text
    const ba = angularLength / 2					// base angle
    let out = '<g class="gear-text">'

    for (var i = 0; i < tdata.lines.length; i++) {
        out += '<polyline class="gear-text" fill="none" stroke="#444" stroke-width="0.5" stroke-linecap="square" stroke-miterlimit="1"  points="';
        for (var p = 0, a, r, dot; p < tdata.lines[i].length; p++) {
            a = -tdata.lines[i][p].x * plotAngle + ba;
            r = (tdata.lines[i][p].y - 5) * pixH + textB;
            dot = polarToLinear({ r, a });
            out += dot.x * sc + " " + dot.y * sc + " ";
        }
        out += '"/>';
    }
    out += "</g>";
    return out;
}
import { Gear } from "../lib/Gear"


export function ExampleGears() {
    const gear1 = new Gear({
        N: 8,
        P: 8,
        PADeg: 25
    })
    const gear2 = new Gear({
        N: 19,
        parent: gear1
    })
    const gear3 = new Gear({
        N: 11,
        parent: gear2,
        jointAngleDeg: 10
    })
    const gear4 = new Gear({
        N: 8,
        parent: gear3,
        jointAngleDeg: 60
    })
    const gear5 = new Gear({
        N: 9,
        parent: gear2,
        jointAngleDeg: 70
    })
    const gear6 = new Gear({
        N: 11,
        parent: gear2,
        jointAngleDeg: -60
    })
    const gear7 = new Gear({
        N: 14,
        parent: gear3,
        jointAngleDeg: -40
    })
    const gear8 = new Gear({
        N: 14,
        P: 20,
        parent: gear2,
        axleJoint: true
    })
    const gear9 = new Gear({
        N: 25,
        parent: gear8,
        jointAngleDeg: -150
    })
    const gear10 = new Gear({
        N: 20,
        parent: gear7,
        jointAngleDeg: 180,
        internal: true,
        layer: 0
    })


    return [gear1, gear2, gear3, gear4, gear5, gear6, gear7, gear8, gear9, gear10]
}

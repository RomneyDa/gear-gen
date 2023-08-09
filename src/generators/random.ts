import { Gear } from "../lib/Gear";

const randomInRange = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min)

export function RandomGearsDiagonalLeft() {
    const minPitch = 7
    const maxPitch = 12
    const pitch = randomInRange(minPitch, maxPitch)

    const minNumberofGears = 8
    const maxNumberofGears = 30
    const numberOfGears = randomInRange(minNumberofGears, maxNumberofGears)

    const minPressureAngle = 22
    const maxPressureAngle = 32
    const pressureAngle = randomInRange(minPressureAngle, maxPressureAngle)

    const minNumberOfTeeth = 8
    const maxNumberOfTeeth = 20

    const minJointAngle = -90
    const maxJointAngle = 0

    const gears: Gear[] = []
    const firstGear = new Gear({
        N: randomInRange(minNumberOfTeeth, maxNumberOfTeeth),
        P: pitch,
        PADeg: pressureAngle
    })
    gears.push(firstGear)
    for (let i = 1; i <= numberOfGears; i++) {
        const gear = new Gear({
            N: randomInRange(minNumberOfTeeth, maxNumberOfTeeth),
            parent: gears[i - 1],
            // jointAngleDeg: randomInRange(gears[i - 1].jointAngleDeg - 90, gears[i - 1].jointAngleDeg + 90)
            jointAngleDeg: randomInRange(minJointAngle, maxJointAngle)
        })
        gears.push(gear)
    }

    return gears
}

export function RandomSpiralGears(n: number) {
    const minPitch = 7
    const maxPitch = 12
    const pitch = randomInRange(minPitch, maxPitch)

    const minNumberOfTeeth = 8
    const maxNumberOfTeeth = 15

    const minPressureAngle = 22
    const maxPressureAngle = 32
    const pressureAngle = randomInRange(minPressureAngle, maxPressureAngle)

    const gears: Gear[] = []
    const firstGear = new Gear({
        N: randomInRange(minNumberOfTeeth, maxNumberOfTeeth),
        P: pitch,
        PADeg: pressureAngle
    })
    gears.push(firstGear)
    let a = 0
    for (let i = 1; i <= n; i++) {
        const gear = new Gear({
            N: randomInRange(minNumberOfTeeth, maxNumberOfTeeth),
            parent: gears[i - 1],
            jointAngleDeg: a
        })
        gears.push(gear)
        a -= 17
    }
    return gears
}

export function RandomBackAndForth(rasters: number) {
    const minPitch = 9
    const maxPitch = 12
    const pitch = randomInRange(minPitch, maxPitch)

    const minNumberOfTeeth = 8
    const maxNumberOfTeeth = 10

    const minPressureAngle = 24
    const maxPressureAngle = 28
    const pressureAngle = randomInRange(minPressureAngle, maxPressureAngle)

    const gears: Gear[] = []
    const firstGear = new Gear({
        N: randomInRange(minNumberOfTeeth, maxNumberOfTeeth),
        P: pitch,
        PADeg: pressureAngle
    })
    gears.push(firstGear)
    const perRaster = 7
    let a = 0
    for (let i = 1; i <= perRaster * rasters; i++) {
        if (i % perRaster === 0) a = -90
        else if (i % (2 * perRaster) < perRaster) a = -15
        else a = -175
        const gear = new Gear({
            N: randomInRange(minNumberOfTeeth, maxNumberOfTeeth),
            parent: gears[i - 1],
            jointAngleDeg: a
        })
        gears.push(gear)
    }
    return gears

}
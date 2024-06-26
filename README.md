# @dromney/gear-gen

A dependency-free typescript npm package that provides a set of powerful classes that can be used to insert dynamically-generated, animateable spur gears and gear sets into your frontend.

### Examples

-   A Pure HTML/javascript example can be found in [(/dist/examples/index.html)](https://github.com/RomneyDa/gear-gen/tree/main/dist/examples/index.html)
-   [Live React example](https://incomparable-biscotti-92aa2f.netlify.app/)

## Installation

### `npm install @dromney/gear-gen`

## Intro

**Simple example**

```typescript
import { Gear } from "@dromney/gear-gen"
const gear = new Gear({
    N: 20, // number of teeth
    P: 8, // diametral pitch
})
console.log(
    `The gear is represented with a diameter of ${gear.D} pseudo-units, scaled by ${gear.scale} pixels per unit`
)
console.log("The gear can be displayed with this SVG:", gear.svg)
console.log("Or this dxf:", gear.dxf)

const childGear = new Gear({
    parent: gear1,
    N: 12,
}) // Inherits diametrical pitch from parent

const gearSet = new GearSet([gear, childGear])
gearSet.downloadAllSVGs() // In a browser environment, downloads an SVG of the two gears connected
```

This package can be used fully by understanding the following:

-   [Gear](#gear): a class representation of a single gear
-   [GearSet](#gearset): a class wrapper around an array of `Gear`s that provides additional functionality for groups of gears
-   [Generators](#generators): a paradigm for dynamically generating `GearSet`s or lists of `Gear`s
-   [Styles](#styles): powerful CSS support for gear styling, with pre-defined classes and a CSS template provided

### Gear

An instance of a `Gear` represents a single spur gear and all its associated methods, visual representation, etc. It can optionally be associated with another gear in a parent-child relationship. For a simple example, see above. Details below.

**Constructor**

A `Gear` can be constructed with an object that follows the `GearConstructor` interface. Note that almost all the parameters are optional and have reasonable defaults.

```typescript
interface GearConstructor {
    id?: string // Optional string identifier. Defaults to a randomly generated 5-capital-letter sequence
    N?: number // Number of teeth, default 12
    D?: number // Pitch diameter, default 2
    P?: number // Diametrical pitch, default not set / calculated by N and D
    PADeg?: number // Pressure angle - DEGREES, default 27
    parent?: Gear // Parent gear
    jointAngleDeg?: number // Angle in degrees of a line drawn from the center of the parent gear to the center of this gear, default -60 degrees (down and to the left)
    internal?: boolean // Internal gear? default false
    internalThickness?: number // Ratio of thickness of the outer ring of an internal gear to its pitch diameter, default 0.5
    axleJoint?: boolean // Is the gear attached to its parent with a fixed axle through the center or not? default false
    layer?: number // display order to force displaying gears with a certain priority - translates to CSS z-index, default 1
    scale?: number // display scale of pixels per diametrical unit, default 100
}
```

For simple usage, the constructor allows flexible inputs and has reasonable default params, but checks thoroughly to ensure the gear is valid. These are summarized as follows:

-   Pressure angle is limited between 15 and 35 degrees
-   Scale cannot be set if a parent is provided; it must be inherited
-   On any gear, P, N, and D can't all be set as two are used calculate the other
-   If the gear is an axle joint, a parent must be provided, and N or D are required. Diametral pitch and pressure angle are by default inherited from the parent but can be changed since the teeth don't need to mesh
-   If the gear is NOT an axle joint, the teeth must mesh, so:
    -   If a parent is provided, diametrical pitch and pressure angle MUST inherit from the parent and can NOT be set. Otherwise, only N OR D (not both) are required
    -   If a parent is NOT provided, two dimensions must be provided, i.e. either N/D, N/P, or P/D
-   If an internal parent is provided, the gear cannot be internal, since two internal gears cannot mesh

**Examples**

```typescript
import { Gear } from "@dromney/gear-gen"

// The root gear has 8 teeth, a diametrical pitch of 8, and a pressure angle of 25 deg
const gear1 = new Gear({
    N: 8,
    P: 8,
    PADeg: 25,
})

// The next gear is a child of the root gear and will inherit its diametrical pitch but will be larger, with 19 teeth
const gear2 = new Gear({
    N: 19,
    parent: gear1,
})

// Gear #3 will be a smaller child of Gear #2, with 11 teeth. Its center will be positioned 10 degrees above the horizontal from its parent Gear #2
const gear3 = new Gear({
    N: 11,
    parent: gear2,
    jointAngleDeg: 10,
})

// Gear #4 will be a child of Gear #3, positioned up 60 degrees from #3. 8 teeth.
const gear4 = new Gear({
    N: 8,
    parent: gear3,
    jointAngleDeg: 60,
})

// Going backwards, Gear #5 is another child of Gear #2! It will be positioned up and to the right of #2.
const gear5 = new Gear({
    N: 9,
    parent: gear2,
    jointAngleDeg: 70,
})

// Gear #6 is also a child of #2. Gear #2 now has 3 children. #6 will have 11 teeth and be positioned down and to the right of #2.
const gear6 = new Gear({
    N: 11,
    parent: gear2,
    jointAngleDeg: -60,
})

// Gear #7 is another child of #3, positioned down and to the right. Gear #3 now has 2 children. 14 teeth.
const gear7 = new Gear({
    N: 14,
    parent: gear3,
    jointAngleDeg: -40,
})

// Gear #2 now has 4 children - that is, it's driving 4 gears! Gear 8 has more teeth, but since its an axle joint, it can have a new diametrical pitch, and will end up being smaller.
const gear8 = new Gear({
    N: 14,
    P: 20,
    parent: gear2,
    axleJoint: true,
})

// Gear #9 is a child of the new little axle joint gear #8, down and to the left.
const gear9 = new Gear({
    N: 25,
    parent: gear8,
    jointAngleDeg: -150,
})

// Finally, a new internal gear driven by #7, positioned at 180 degrees. To help the gear set look nice, a layer of zero has been added to place this gear visually behind others
const gear10 = new Gear({
    N: 20,
    parent: gear7,
    jointAngleDeg: 180,
    internal: true,
    layer: 0,
})

const gears = [
    gear1,
    gear2,
    gear3,
    gear4,
    gear5,
    gear6,
    gear7,
    gear8,
    gear9,
    gear10,
]
```

![Example gears, displayed using @dromney/react-gear-gen](https://github.com/RomneyDa/gear-gen/assets/6581799/ad3bd8b8-7b57-4adb-84dc-652bf49df7e1 "Example gears, displayed using @dromney/react-gear-gen")

**Visualiation**

-   `gear.svg` stores a string of the svg element that can be used to display the gear
-   `gear.dxf` similarly stores a dxf filestring for viewing, etc.

**Other properties and attributes**

-   `gear.D`/`gear.r`: Pitch diameter/radius, default 2
-   `gear.N`: Number of teeth, default 12
-   `gear.P`: Diametrical pitch, default not set / calculated by N and D
-   `gear.id`: Optional string identifier. Defaults to a randomly generated 5-capital-letter sequence
-   `gear.PADeg`: Pressure angle in degrees, default 27
-   `gear.parent`: Parent gear
-   `gear.axleJoint`: Is the gear attached to its parent with a fixed axle through the center or not? default false
-   `gear.internal`: Internal gear? default false
-   `gear.dInner`/`gear.rInner`: diameter/radius of the gear to the start of the teeth (end for internal gear)
-   `gear.dOuter`/`gear.rOuter`: diameter/radius of the gear to the end of the teeth (start for internal gear)
-   `gear.dBase`/`gear.rBase`: a useful mathematical length - pitch diameter/radius \* cos(pressure angle)
-   `rScaled`: Pitch radius scaled in pixels
-   `gear.jointAngleDeg`: Angle in degrees of a line drawn from the center of the parent gear to the center of this gear
-   `gear.internalThickness`: Ratio of thickness of the outer ring of an internal gear to its pitch diameter, default 0.5
-   `gear.scale`: display scale of pixels per diametrical unit, default 100
-   `size` - pixel size (square) of full gear svg footprint
-   `gear.x`: global X pixel center position of the gear, considering parent and all
-   `gear.y`: global Y pixel center positioin of the gear, considering parent and all
-   `gear.offsetX`: X pixel distance from parent's center
-   `gear.offsetY`: Y pixel distance from parent's center
-   `gear.svgOffsetX`: global left pixel offset distance for SVG placement
-   `gear.svgOffsetY`: global top pixel offset distance for SVG placement
-   `gear.rot`: global rotation of the gear in deg, considering parent and all
-   `toothModule`: adjusts the width of teeth - be careful with this, changing is not yet supported. Default 2
-   `toothGap`: adjusts the length of the teeth, or more accurately, the clearance past the end of the tooth to another gear's inner radius when engaged. Default 0.3
-   `gear.description`: a brief, useful text description of the gear
-   `gear.isInternalLink`: boolean property that checks if this or the parent is internal
-   `gear.ratio`: the ratio of the gear relative to its parent
-   `gear.totalRatio`: the total ratio of the gear relative to the root gear
-   `gear.crossSize`: size of the svg rendered center cross. Default 8
-   `gear.holeSize`: size of the svg rendered center hole. Default 0.25. Overridden by css `radius` styling
-   `gear.layer`: display order to force displaying gears with a certain priority - translates to CSS z-index, default 1

**Methods**

-   `gear.downloadSVG()`: in a browser setting, triggers a download of `gear.svg`
-   `gear.downloadDXF()`: in a browser setting, triggers a download of `gear.dxf`
-   `gear.getRot(globalRot: number)` - based on global rotation (rotation of root gear, gets rotation of this gear). This uses a faster but less safe mechanism that assumes render order matches the parent-child order and parents are always rendered first
-   `gear.getRotSafe(globalRot: number)` - based on global rotation (rotation of root gear, gets rotation of this gear). This uses a slower but safer mechanism that always recursively calculates rot all the way up the parent chain

Other methods and properties are left accessible but omitted here because they are intended for internal use.

### GearSet

A GearSet is a class that contains an array of gears and offers shared methods for working with them. It is created by passing an array of gears.

**Example**

```typescript
import { ExampleGears } from "@dromney/gear-gen"
const exampleGearSet = new GearSet(ExampleGears)
console.log(exampleGearSet.dimensions)
exampleGearSet.downloadAllSVGs(0, 10) // no padding, 10 deg rotation offset
```

**Methods and attributes**

-   `gearSet.gears` attribute - the array of gears passed upon creation
-   `gearSet.dimensions`: property that returns a `{ h, w }` height/width object with the pixel dimensions of the entire gear set, considering connections, positioning etc.
-   `gearSet.downloadAllSVGs()`: method that downloads an svg file that contains svg images for all the gears in the set, in position. Can be passed `padding` in pixels to surround the full set (defaults to 0) and `angle` of rotation (defaults to 0).

### Generators

A gear generator is a function that may take parameters and outputs a (potentially randomized) list of gears or GearSet. Currently, there is no specific class or mechanism for this, but some examples are provided in src/generators, inluding `RandomGearsDiagonalLeft`, `RandomSpiralGears`, and `RandomBackAndForth`. Randomized gear generation is much simplified because gear positioning is automitically calculated given a connection angle.

The following example is a simple gear generator that outputs a list of gears. All the gears have the same pitch (random 7-12) and pressure angle (random 22-32). Each gear has a random number of teeth between 8 and 20. The total number of gears is random, between 10 and 30. A parent gear is generated, and then new gears up to the total number, each gear having the previous one as its parent.

```typescript
import { Gear } from "@dromney/gear-gen"

const randomInRange = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1) + min)

export function RandomGearsDiagonalExample() {
    const pitch = randomInRange(7, 12)
    const numberOfGears = randomInRange(10, 30)
    const pressureAngle = randomInRange(22, 32)

    const minNumberOfTeeth = 8
    const maxNumberOfTeeth = 20

    const minJointAngle = -90
    const maxJointAngle = 0

    const gears: Gear[] = []
    const parentGear = new Gear({
        N: randomInRange(minNumberOfTeeth, maxNumberOfTeeth),
        P: pitch,
        PADeg: pressureAngle,
    })
    gears.push(parentGear)
    for (let i = 1; i <= numberOfGears; i++) {
        const gear = new Gear({
            N: randomInRange(minNumberOfTeeth, maxNumberOfTeeth),
            parent: gears[i - 1],
            jointAngleDeg: randomInRange(minJointAngle, maxJointAngle),
        })
        gears.push(gear)
    }

    return gears
}
```

Future support could be added to streamline this process and standardize GearSet output, etc.

### Styles

Pre-defined classes, such as `.gear-cross`, are built into the generated SVGs with defaults and can used in CSS to modify gear styles.

Some example full style sets are provided and can be directly imported into your code:

```typescript
import "@dromney/gear-gen/styles/bluey.css" // OR
import "@dromney/gear-gen/styles/dark.css" // OR
import "@dromney/gear-gen/styles/outline.css"
```

Or, a `.css.template` is provided in `@dromney/styles` with all the relevant class names and can be copied and modified for custom styles.

```css
.gear-view {
    background-color: #2b2b2b;
}
.gear-hole {
    r: 10px;
    stroke: #999;
    stroke-width: 1px;
}
.gear-profile {
    fill: #7b7b7b;
    stroke: #999;
    stroke-width: 2px;
}
.gear-first-tooth-marker {
    fill: #333;
    opacity: 0.3;
}
.gear-guides {
    display: none;
}
```

## Future Improvements

There is a lot of room for improvement in `GearSet`s and generator examples. A new `GearSetGenerator` class or similar could be powerful.

Rack and pinion - could be infinite or set length. If finite length, would likely need to limit a `GearSet`s rotation. Could be used for effects such as having a rack as the side of a `<div>` to make it appear as though the gear is moving the `<div>`.

## Used in

[@dromney/react-gear-gen](https://github.com/romneyda/react-gear-gen) (npm package) provides React components for displaying gears generated by this library, along with examples.

[@dromney/react-gear-gen-example](https://github.com/romneyda/react-gear-gen-example) is a live-hosted example of the above React package (see repo for link).

## Credits

Inspiration from the work of:

-   [Woodgears.ca](https://woodgears.ca/gear_cutting/template.html)
-   Abel Vince [Gear Generator](https://geargenerator.com/#200,200,100,6,1,3,0,4,1,8,2,4,27,-90,0,0,0,0,0,0,16,4,4,27,-60,0,0,0,0,1,1,12,1,12,20,-60,0,0,0,0,2,0,60,5,12,20,0,1,0,0,0,0,0,3,-515)
-   Michal Zalewski [Creating Spur Gears](https://lcamtuf.coredump.cx/gcnc/ch6/#6.2)

# @dromney/gear-gen
A dependency-free typescript npm package that provides a set of powerful classes that can be used to insert dynamically-generated, animateable spur gears and gear sets into your frontend.

[Live example](https://incomparable-biscotti-92aa2f.netlify.app/)

## Installation
### `npm install @dromney/gear-gen`

## Intro
**Simple example**
```typescript
import { Gear } from '@dromney/gear-gen'
const gear = new Gear({
    N: 20, // number of teeth
    P: 8, // diametral pitch
})
console.log(`The gear is represented with a diameter of ${gear.D} pseudo-units, scaled by ${gear.scale} pixels per unit`)
console.log("The gear can be displayed with this SVG:", gear.svg)
console.log("Or this dxf:", gear.dxf)

const childGear = new Gear({
    parent: gear1,
    N: 12
}) // Inherits diametrical pitch from parent

const gearSet = new GearSet([gear, childGear])
gearSet.downloadAllSVGs() // In a browser environment, downloads an SVG of the two gears connected
```

This package can be used fully by understanding the following:
- [Gear](#gear): a class that represents a single spur gear and all its associated methods, visual representation, etc. Can optionally be associated with another gear in a parent-child relationship
- [GearSet](#gearset): a wrapper around an array of `Gear`s that provides additional functionality for the group
- [Generators](#generators): a paradigm for dynamically generating `GearSet`s or lists of `Gear`s
- [Styles](#styles): powerful CSS support for gear styling, with pre-defined classes and a CSS template provided

### Gear

**Constructor**
`Gear`s can be constructed with an object that follows the `GearConstructor` interface. Note that almost all the parameters are optional and have reasonable defaults.
```typescript
interface GearConstructor {
    id?: string // Optional string identifier. Defaults to a randomly generated 5-capital-letter sequence
    N?: number // Number of teeth, default 12
    D?: number // Pitch diameter, default 2
    P?: number // Pitch, default not set / calculated by N and D
    PADeg?: number // Pressure angle - DEGREES, default 27
    parent?: Gear, // Parent gear
    jointAngleDeg?: number // Angle in degrees of a line drawn from the center of the parent gear to the center of this gear, default -60 degrees (down and to the left)
    internal?: boolean // Internal gear? default false
    internalThickness?: number // Ratio of thickness of the outer ring of an internal gear to its pitch diameter, default 0.5
    axleJoint?: boolean // Is the gear attached to its parent with a fixed axle through the center or not? default false
    layer?: number // display order to force displaying gears with a certain priority - translates to CSS z-index, default 1
    scale?: number // display scale of pixels per diametrical unit, default 100
}
```


For simple usage, the constructor allows flexible inputs and has reasonable default params, but checks thoroughly to ensure the gear is valid. These are summarized as follows:
- Pressure angle is limited between 15 and 35 degrees
- Scale cannot be set if a parent is provided; it must be inherited
- On any gear, P, N, and D can't all be set as two are used calculate the other
- If the gear is an axle joint, a parent must be provided, and N or D are required. Diametral pitch and pressure angle are by default inherited from the parent but can be changed since the teeth don't need to mesh
- If the gear is NOT an axle joint, the teeth must mesh, so:
    - If a parent is provided, diametrical pitch and pressure angle MUST inherit from the parent and can NOT be set. Otherwise, only N OR D (not both) are required
    - If a parent is NOT provided, two dimensions must be provided, i.e. either N/D, N/P, or P/D
- If an internal parent is provided, the gear cannot be internal, since two internal gears cannot mesh

**Visualiation**


**Other methods and attributes**
- crossSize: size of the svg rendered center cross. Default 8
- holeSize: size of the svg rendered center hole. Default 0.25

### GearSet
A GearSet is a class that contains an array of gears and offers shared methods for working with them. It is created by passing an array of gears

**Example**
```typescript
import { ExampleGears } from '@dromney/gear-gen'
const exampleGearSet = new GearSet(ExampleGears)
console.log(exampleGearSet.dimensions)
exampleGearSet.downloadAllSVGs(0, 10) // no padding, 10 deg rotation offset
```

**Methods and attributes**
- `gearSet.gears` attribute - the array of gears passed upon creation
- `gearSet.dimensions`: property that returns a `{ h, w }` height/width object with the pixel dimensions of the entire gear set, considering connections, positioning etc.
- `gearSet.downloadAllSVGs()`: method that downloads an svg file that contains svg images for all the gears in the set, in position. Can be passed `padding` in pixels to surround the full set (defaults to 0) and `angle` of rotation (defaults to 0).

### Generators
A gear generator is a function that may take parameters and outputs a (potentially randomized) list of gears or GearSet. Currently, there is no specific class or mechanism for this, but some examples are provided in src/generators, inluding `RandomGearsDiagonalLeft`, `RandomSpiralGears`, and `RandomBackAndForth`. Randomized gear generation is much simplified because gear positioning is automitically calculated given a connection angle. 

The following example is a simple gear generator that outputs a list of gears. All the gears have the same pitch (random 7-12) and pressure angle (random 22-32). Each gear has a random number of teeth between 8 and 20. The total number of gears is random, between 10 and 30. A parent gear is generated, and then new gears up to the total number, each gear having the previous one as its parent.

```typescript
import { Gear } from "@dromney/gear-gen";

const randomInRange = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min)

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
        PADeg: pressureAngle
    })
    gears.push(parentGear)
    for (let i = 1; i <= numberOfGears; i++) {
        const gear = new Gear({
            N: randomInRange(minNumberOfTeeth, maxNumberOfTeeth),
            parent: gears[i - 1],
            jointAngleDeg: randomInRange(minJointAngle, maxJointAngle)
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
import '@dromney/styles/bluey.css' // OR
import '@dromney/styles/dark.css' // OR
import '@dromney/styles/outline.css'
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
[@dromney/react-gear-gen](github.com/romneyda/react-gear-gen) (npm package) provides React components for displaying gears generated by this library, along with examples.

[@dromney/react-gear-gen-example](github.com/romneyda/react-gear-gen-example) is a live-hosted example of the above React package (see repo for link).

## Credits
Inspiration from the work of:
- Abel Vince [Gear Generator](https://geargenerator.com/#200,200,100,6,1,3,0,4,1,8,2,4,27,-90,0,0,0,0,0,0,16,4,4,27,-60,0,0,0,0,1,1,12,1,12,20,-60,0,0,0,0,2,0,60,5,12,20,0,1,0,0,0,0,0,3,-515)
- Michal Zalewski [Creating Spur Gears](https://lcamtuf.coredump.cx/gcnc/ch6/#6.2)
# gear-pattern-generator

# Intro

Credit to https://lcamtuf.coredump.cx/gcnc/ch6/#6.2

Everything you need to insert generated responsive gears into your frontend!

### This library includes:

- Base types (see below)
- Generation function examples - functions that output arrays of gears generated in various patterns
  - blah
- Example hooks for translating mouse position or time/loop into animated value
  - Mouse position hooks
    1. Simple x + y
    2. Magnitude of the position from (0, 0): sqrt(x^2 + y^2)
    3. Determines which gear mouse is over and where movement is from center, and rotates based on that
    4. Same as number 3 but accounts for distance from gear's center
  - Time loop hooks
- A few example gear image sets



# Base types and architecture

First things first, you need a GearSet to work with!
- Gear sets are arrays of 
- Gear images:
  - PNG format with transparent background
  - No extra space around the edges
  - One tooth centered on the right side, pointing directly right. This convention is used to follow angle conventions, which have zero along the positive x axis
  - All gears in a set must have the same diametral pitch and tooth size
- A JSON File with some specifications:
  - For the set, two constants must be specified:
    1. Diametrial pitch
    2. Tooth length past diametral pitch
  - Within an array, an object for each gear should specify:
    1. Gear name (OPTIONAL)
    2. Gear diameter
    3. Filepath to gear image
- Note, only one gear is fine!
- TODO: expound on creating these sets and the folder/reference structure, and provide dimensional reference images

### These repos are examples of this library in action:

- React, using React Animated:
- React Native, using React Native Reanimated 2:
# Generate sprite image and json without Mapnik

- SVG and PNG icon inputs
- Multiple pixel ratio support
- Uses `sharp` for rendering (compatibility with newer Node.js versions and architectures)
- Supports SDF icons ([including proper `@2x` generation](https://github.com/dschep-bug-repos/sdf-2x-generation))

## Install

```bash
npm install github:dschep/sprite-one
```

## Usage

- CLI

```bash
$ sprite-one -h
Usage: sprite-one [options] <sprite_filename>

generate sprite from icons

Options:
  -v, --version            output the version number
  -i, --icon <icons...>    A folder path which stores SVG icons. Multiple folders can be set.
  -r, --ratio <ratios...>  pixel ratio to generate sprite. default is 1.
  --sdf                    generate sprite with SDF (Signed Distance Field). (default: false)
  -h, --help               display help for command
```

- npm

```javascript
import { generateSprite } from '@unvt/sprite-one'

generateSprite('../out', '../input', [2]).then(() => {})
```

If multiple ratios are specified in either CLI or Node.js, the default file names when the ratio is more than one will be changed to the standard file name used by Mapbox and MapLibre (e.g., `sprite.json` for 1 ratio, `sprite@2x.json` for 2 ratio...).

### Multiple pixel ratio support

You can supply mulitple pixel ratio versions of the same icon in the directory by using the following naming convention:

- `[name].png` or `[name].svg` -- the default icon
- `[name]@2x.png` or `[name]@2x.svg` -- the icon to use in the 2x spritesheet

If the `@2x` version doesn't exist, the default icon will be used and scaled up appropriately. If you are using PNG icons, it is strongly recommended that you prepare alternate versions for each pixel ratio you require.

Note that while this feature is supported for SVG icons, this is usually unneccesary because SVG, as a vector format, can be scaled without problems.

### SDF icons support

SDF icons can be generated by using the `--sdf` option. This allows users to apply [icon-color](https://maplibre.org/maplibre-style-spec/layers/#paint-symbol-icon-color) and [icon-halo-color](https://maplibre.org/maplibre-style-spec/layers/#paint-symbol-icon-halo-color) properties in Maplibre style to able to change the colour dynamically.

```javascript
import { generateSprite } from '@unvt/sprite-one'

generateSprite('../out', '../input', [1], true).then(() => {})
```

## Develop

via `bin/index.ts`

```bash
git clone https://github.com/dschep/sprite-one.git
cd sprite-one
npm install
npx ts-node src/bin/index.ts ../../tmp/out --icon ../../tmp/maki/icons
npx ts-node src/bin/index.ts ../../tmp/out --icon ../../tmp/maki/icons --ratio=2
npx ts-node src/bin/index.ts ../../tmp/out --icon ../../tmp/maki/icons --icon ../../tmp/maki/icons2 --ratio=1 --ratio=2
```

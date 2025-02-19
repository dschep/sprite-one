"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Image = void 0;
const sharp_1 = __importDefault(require("sharp"));
class Image {
    constructor(source_file, ratio, name, file_ratio) {
        this.width = 0;
        this.height = 0;
        this.range = 1;
        this.buffer_length = 3;
        this.rendered_image = null;
        this.sdf = false;
        this.x = 0;
        this.y = 0;
        this.source_file = source_file;
        this.name = name;
        this.ratio = ratio;
        this.file_ratio = file_ratio || 1;
        this.buffer_length *= this.ratio;
        if (this.file_ratio > 1 && this.ratio !== this.file_ratio) {
            throw new Error(`If the file_ratio is not 1, it must be equal to the ratio`);
        }
    }
    parse(sdf = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const metadata = yield (0, sharp_1.default)(this.source_file).metadata();
            this.width = metadata.width;
            this.height = metadata.height;
            this.range = this.width * this.height;
            this.sdf = sdf;
            this.rendered_image;
            const intermediate_image = (0, sharp_1.default)(this.source_file);
            if (this.real_height() !== this.height ||
                this.real_width() !== this.width) {
                this.rendered_image = yield intermediate_image
                    .resize(this.real_width(), this.real_height())
                    .toBuffer();
            }
            else {
                // because the image is already at the specified size, we can use it directly.
                this.rendered_image = yield intermediate_image.toBuffer();
            }
            if (sdf) {
                // add buffer
                this.rendered_image = yield (0, sharp_1.default)({
                    create: {
                        width: this.buffer_width(),
                        height: this.buffer_height(),
                        channels: 4,
                        background: { r: 0, g: 0, b: 0, alpha: 0 },
                    },
                })
                    .composite([
                    {
                        input: this.rendered_image,
                        top: this.buffer_length,
                        left: this.buffer_length,
                    },
                ])
                    .raw()
                    .toBuffer();
                const radius = 8 * this.ratio;
                const img = this.rendered_image;
                const pixelArray = new Uint8ClampedArray(img.buffer);
                const alphas = [];
                for (let i = 0; i < pixelArray.length; i += 4) {
                    const alpha = pixelArray[i + 3];
                    alphas.push(alpha);
                }
                const outer_df = alphas.map((alpha) => {
                    if (alpha === 0)
                        return Number.MAX_VALUE;
                    return Math.max(0, 0.5 - alpha / 255) ** 2;
                });
                const inner_df = alphas.map((alpha) => {
                    if (alpha === 255)
                        return Number.MAX_VALUE;
                    return Math.max(0, alpha / 255 - 0.5) ** 2;
                });
                for (let col = 0; col < this.buffer_width(); col++) {
                    dt(outer_df, col, this.buffer_width(), this.buffer_height());
                    dt(inner_df, col, this.buffer_width(), this.buffer_height());
                }
                for (let row = 0; row < this.buffer_height(); row++) {
                    dt(outer_df, row * this.buffer_width(), 1, this.buffer_width());
                    dt(inner_df, row * this.buffer_width(), 1, this.buffer_width());
                }
                const result = outer_df.map((outerDfValue, index) => {
                    const innerDfValue = inner_df[index];
                    return Math.min(1.0, Math.max(-1.0, (Math.sqrt(outerDfValue) - Math.sqrt(innerDfValue)) / radius));
                });
                const colors = clamp_to_u8(result, 0.25);
                for (let i = 0, j = 0; i < pixelArray.length; i += 4, j++) {
                    pixelArray[i + 3] = colors[j];
                }
                this.rendered_image = yield (0, sharp_1.default)(pixelArray, {
                    raw: {
                        width: this.buffer_width(),
                        height: this.buffer_height(),
                        channels: 4,
                    },
                })
                    .png()
                    .toBuffer();
            }
            return this;
        });
    }
    real_width() {
        return Math.round((this.width / this.file_ratio) * this.ratio);
    }
    real_height() {
        return Math.round((this.height / this.file_ratio) * this.ratio);
    }
    buffer_width() {
        return this.real_width() + this.buffer_length * 2;
    }
    buffer_height() {
        return this.real_height() + this.buffer_length * 2;
    }
    to_obj() {
        if (this.sdf) {
            return {
                height: this.buffer_height(),
                width: this.buffer_width(),
                x: this.x,
                y: this.y,
                pixelRatio: this.ratio,
                sdf: this.sdf,
            };
        }
        return {
            height: this.real_height(),
            width: this.real_width(),
            x: this.x,
            y: this.y,
            pixelRatio: this.ratio,
        };
    }
}
exports.Image = Image;
// original code from https://github.com/stadiamaps/sdf_font_tools/blob/main/sdf_glyph_renderer/src/core.rs
function dt(grid, offset, stepBy, size) {
    // f is a one-dimensional slice of the grid
    const f = [];
    for (let i = offset; i < grid.length; i += stepBy) {
        f.push(grid[i]);
    }
    let k = 0;
    const v = new Array(size).fill(0);
    const z = new Array(size + 1).fill(Number.MIN_VALUE);
    z[1] = Number.MAX_VALUE;
    let s;
    for (let q = 1; q < size; q++) {
        while (true) {
            const q2 = q * q;
            const vk2 = v[k] * v[k];
            const denom = 2 * q - 2 * v[k];
            s = (f[q] + q2 - (f[v[k]] + vk2)) / denom;
            if (s <= z[k]) {
                k -= 1;
            }
            else {
                k += 1;
                v[k] = q;
                z[k] = s;
                z[k + 1] = Number.MAX_VALUE;
                break;
            }
        }
    }
    k = 0;
    for (let q = 0; q < size; q++) {
        const qf64 = q;
        while (z[k + 1] < qf64) {
            k += 1;
        }
        const vkf64 = v[k];
        grid[offset + q * stepBy] = (qf64 - vkf64) * (qf64 - vkf64) + f[v[k]];
    }
}
// original code: https://github.com/stadiamaps/sdf_font_tools/blob/main/sdf_glyph_renderer/src/core.rs#L221C2-L221C2
function clamp_to_u8(sdf, cutoff) {
    if (cutoff <= 0.0 || cutoff >= 1.0) {
        throw new Error('cutoff must be between 0 and 1');
    }
    return sdf.map((v) => {
        return 255.0 - 255.0 * (v + cutoff);
    });
}
//# sourceMappingURL=image.js.map
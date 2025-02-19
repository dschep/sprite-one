"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Matrix = void 0;
const bin_pack_1 = __importDefault(require("bin-pack"));
class Matrix {
    constructor(images) {
        this.position_x = 0;
        this.position_y = 0;
        this.max_x = 0;
        this.max_y = 0;
        this.images = images;
    }
    calc() {
        const result = (0, bin_pack_1.default)(this.images.map((image) => {
            return {
                image,
                width: image.sdf ? image.buffer_width() : image.real_width(),
                height: image.sdf ? image.buffer_height() : image.real_height(),
            };
        }));
        this.max_x = result.width;
        this.max_y = result.height;
        for (const obj of result.items) {
            obj.item.image.x = obj.x;
            obj.item.image.y = obj.y;
        }
    }
}
exports.Matrix = Matrix;
//# sourceMappingURL=matrix.js.map
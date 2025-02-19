"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.generateSprite = void 0;
const path_1 = __importDefault(require("path"));
const fs = __importStar(require("fs"));
const image_1 = require("./image");
const matrix_1 = require("./matrix");
const sharp_1 = __importDefault(require("sharp"));
const generate = (output_file_name, input_directories, ratio, defaultSpriteName = false, sdf = false) => __awaiter(void 0, void 0, void 0, function* () {
    let spriteName = '';
    if (defaultSpriteName === true) {
        if (ratio > 1) {
            spriteName = `@${ratio}x`;
        }
    }
    const output_json = `${output_file_name}${spriteName}.json`;
    const output_png = `${output_file_name}${spriteName}.png`;
    // Get file list
    let images = [];
    for (const input_directory of input_directories) {
        const files = yield fs.promises.readdir(input_directory);
        // If there are multiple icons with the same name but with different pixel ratios
        // (such as icon.png, icon@2x.png), we will group them together and use the appropriate
        // file without scaling. If multiple icons do not exist, we will use the single icon
        // and scale as necessary (for example, when the icon is SVG)
        const dir_file_sets = {};
        for (const file of files) {
            const extname = path_1.default.extname(file); // .svg, .png
            if (extname !== '.svg' && extname !== '.png') {
                // we only support SVG and PNG files right now.
                continue;
            }
            const basename = path_1.default.basename(file, extname); // icon, icon@2x
            const icon_name = basename.replace(/@\d+x$/, ''); // icon, icon
            const ratio_match = basename.match(/@(\d+)x$/);
            const file_ratio = ratio_match ? parseInt(ratio_match[1], 10) : 1;
            const icon_filenames = dir_file_sets[icon_name] || [];
            dir_file_sets[icon_name] = [...icon_filenames, { file_ratio, file }];
        }
        for (const [icon_name, file_set] of Object.entries(dir_file_sets)) {
            const file_at_ratio = file_set.find((x) => x.file_ratio === ratio) ||
                file_set.find((x) => x.file_ratio === 1);
            if (!file_at_ratio)
                continue;
            const source_file = path_1.default.join(input_directory, file_at_ratio.file);
            const image = new image_1.Image(source_file, ratio, icon_name, file_at_ratio.file_ratio);
            images.push(image);
        }
    }
    return Promise.all(images.map((image) => image.parse(sdf))).then((images) => __awaiter(void 0, void 0, void 0, function* () {
        images.sort((a, b) => a.range - b.range);
        const matrix = new matrix_1.Matrix(images);
        matrix.calc();
        // output png
        const inputs = images.map((image) => {
            return { input: image.rendered_image, top: image.y, left: image.x };
        });
        yield (0, sharp_1.default)({
            create: {
                width: matrix.max_x,
                height: matrix.max_y,
                channels: 4,
                background: { r: 0, g: 0, b: 0, alpha: 0 },
            },
        })
            .composite(inputs)
            .png()
            .toFile(output_png);
        // output json
        const json = {};
        images.forEach((image) => {
            json[image.name] = image.to_obj();
        });
        fs.writeFileSync(output_json, JSON.stringify(json));
    }));
});
const generateSprite = (output_file_name, input_directories, ratios = [1], sdf = false) => __awaiter(void 0, void 0, void 0, function* () {
    const promises = [];
    ratios.forEach((ratio) => {
        promises.push(generate(output_file_name, input_directories, ratio, ratios.length > 1, sdf));
    });
    yield Promise.all(promises);
});
exports.generateSprite = generateSprite;
//# sourceMappingURL=index.js.map
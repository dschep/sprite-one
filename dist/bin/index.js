#!/usr/bin/env node
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
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const lib_1 = require("../lib");
const program = new commander_1.Command();
const version = require('../../package.json').version;
program
    .name('sprite-one')
    .version(version, '-v, --version', 'output the version number')
    .arguments('<sprite_filename>')
    .description('generate sprite from icons')
    .requiredOption('-i, --icon <icons...>', 'A folder path which stores SVG icons. Multiple folders can be set.')
    .option('-r, --ratio <ratios...>', 'pixel ratio to generate sprite. default is 1.')
    .option('--sdf', 'generate sprite with SDF (Signed Distance Field).', false)
    .action((spriteFilename) => __awaiter(void 0, void 0, void 0, function* () {
    const options = program.opts();
    if (options.ratio) {
        options.ratio = options.ratio.map((r) => {
            return Number(r);
        });
    }
    yield (0, lib_1.generateSprite)(spriteFilename, options.icon, options.ratio, options.sdf);
}));
program.parse(process.argv);
//# sourceMappingURL=index.js.map
/// <reference types="node" />
import { SpriteImage } from './interfaces';
export declare class Image {
    source_file: string;
    name: string;
    ratio: number;
    file_ratio: number;
    width: number;
    height: number;
    range: number;
    buffer_length: number;
    rendered_image: Buffer | null;
    sdf: boolean;
    x: number;
    y: number;
    constructor(source_file: string, ratio: number, name: string, file_ratio?: number);
    parse(sdf?: boolean): Promise<this>;
    real_width(): number;
    real_height(): number;
    buffer_width(): number;
    buffer_height(): number;
    to_obj(): SpriteImage;
}

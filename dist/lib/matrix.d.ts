import { Image } from './image';
export declare class Matrix {
    images: Image[];
    position_x: number;
    position_y: number;
    max_x: number;
    max_y: number;
    constructor(images: Image[]);
    calc(): void;
}

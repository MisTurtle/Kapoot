import { IconName } from "lucide-react/dynamic";

export const defaultColors = [
    [244,  78,  59],
    [  0, 156, 224],
    [252, 220,   0],
    [ 81, 245,  59]
];

export const buttonColors = [
    [ 77,  77,  77],
    [153, 153, 153],
    [255, 255, 255],
    [244,  78,  59],
    [254, 146,   0],
    [252, 220,   0],
    [219, 223,   0],
    [ 81, 245,  59],
    [104, 204, 202],
    [115, 216, 255],
    [174, 161, 255],
    [253, 161, 255],

    [ 51,  51,  51],
    [128, 128, 128],
    [204, 204, 204],
    [211,  49,  21],
    [226, 115,   0],
    [252, 196,   0],
    [176, 188,   0],
    [104, 188,   0],
    [ 22, 165, 165],
    [  0, 156, 224],
    [123, 100, 255],
    [250,  40, 255],

    [  0,   0,   0],
    [102, 102, 102],
    [179, 179, 179],
    [159,   5,   0],
    [196,  81,   0],
    [251, 158,   0],
    [128, 137,   0],
    [ 25,  77,  51],
    [ 12, 121, 125],
    [  0,  98, 177],
    [101,  50, 148],
    [171,  20, 158]
];

export const allIcons: IconName[] = [ "circle", "squircle", "triangle", "pentagon", "hexagon", "octagon", "sparkle", "star", "club", "diamond", "spade", "heart" ];
export const getIcon = (index?: number) => allIcons[((index ?? 0) + allIcons.length) % allIcons.length];
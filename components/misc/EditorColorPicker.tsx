import { buttonColors } from "@common/constants";
import { FC, useState } from "react";
import { AlphaPicker, BlockPicker, CompactPicker, GithubPicker, HuePicker, RGBColor, SketchPicker, SwatchesPicker, TwitterPicker } from "react-color";

type EditorColorPickerProps = {
    defaultColor?: number[] | RGBColor;
    onChange?: (color: RGBColor) => void;
    onSubmit?: (color: RGBColor) => void;
};

const EditorColorPicker: FC<EditorColorPickerProps> = ({ defaultColor, onChange, onSubmit }) => {
    if(Array.isArray(defaultColor)) 
        defaultColor = { r: defaultColor[0] ?? 0, g: defaultColor[1] ?? 0, b: defaultColor[2] ?? 0 };
    const [ selectedColor, setSelectedColor ] = useState<RGBColor>(defaultColor ?? {r: 0, g: 0, b: 0});

    return (
        <CompactPicker
            colors={buttonColors.map(([r, g, b]) => `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1).toUpperCase()}`)}
            color={selectedColor}
            onChange={(color) => { setSelectedColor(color.rgb); if(onChange) onChange(color.rgb)} }
            onChangeComplete={(color) => { setSelectedColor(color.rgb); if(onSubmit) onSubmit(color.rgb)} }
        />
    );
};

export default EditorColorPicker;

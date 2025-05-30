import {getPlaiceholder} from "plaiceholder";
import fs from "node:fs/promises";

export const getBlurData = async (src: string) => {
    try {
        const buffer = await fs.readFile(`./public${src}`);
        const {base64} = await getPlaiceholder(buffer, {
            brightness: 0.9,
            saturation: 2.5,
            size: 10,
            removeAlpha: true
        });
        return base64;
    } catch (error) {
        console.error("Error generating blur data:", error);
        return undefined;
    }
};
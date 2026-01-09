import {getPlaiceholder} from "plaiceholder";
import fs from "node:fs/promises";

export const getBlurData = async (src: string) => {
    try {
        const buffer = await fs.readFile(`./public${src}`);
        const {base64} = await getPlaiceholder(buffer);
        return base64;
    } catch (error) {
        console.error("Error generating blur data:", error);
        return undefined;
    }
};
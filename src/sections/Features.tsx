//@ts-nocheck
import {getBlurData} from "@/utils/getBlurDataURL";
import FeatureCard from "@/app/_component/FeatureCard";
import {features} from "@/constants";

export default async function Features() {
    const featuresWithBlurData = await Promise.all(
        features.map(async (feature) => ({
            ...feature,
            blurData: await getBlurData(feature.image.source)
        }))
    );

    return (
        <div className="overflow-hidden mb-[180px]">
            {featuresWithBlurData.map((feature, index) => (
                <FeatureCard index={index} feature={feature} />
            ))}
        </div>
    )
}
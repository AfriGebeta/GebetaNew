"use client";

import type { ProductDemo as DemoKey } from "@/constants/products";
import GeocodeSearchDemo from "./geocode-search-demo";
import { MatrixDemo, OneToManyDemo, OptimizationDemo, RouteDemo, TilesDemo } from "./demos";

/** The working fragment shown in a product page's hero. */
export default function ProductDemo({ demo }: { demo: DemoKey }) {
    switch (demo) {
        case "tiles":
            return <TilesDemo zoom={15} />;
        case "geocoding":
            return <GeocodeSearchDemo />;
        case "directions":
            return <RouteDemo />;
        case "matrix":
            return <MatrixDemo className="p-8" />;
        case "optimization":
            return <OptimizationDemo />;
        case "onm":
            return <OneToManyDemo />;
    }
}

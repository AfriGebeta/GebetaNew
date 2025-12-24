import React from "react"
import {cn} from "@/lib/utils";

interface ContainerProps {
    className?: string
    children?: React.ReactNode
}
const Container = ({ className, children  }:ContainerProps) => {
    return (
        <div className={cn("max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full overflow-hidden", className)}>
            {children}
        </div>
    );
};

export default Container;
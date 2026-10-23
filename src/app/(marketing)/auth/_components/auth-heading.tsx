import type { ReactNode } from "react";

type AuthHeadingProps = {
    title: ReactNode;
    description?: ReactNode;
};

export default function AuthHeading({ title, description }: AuthHeadingProps) {
    return (
        <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-[28px] font-medium leading-tight tracking-tight text-foreground">{title}</h1>
            {description && <p className="text-[14px] leading-[1.5] text-soft">{description}</p>}
        </div>
    );
}

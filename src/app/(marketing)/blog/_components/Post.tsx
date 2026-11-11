import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export type PostSummary = {
    slug: string;
    title: string;
    excerpt?: string;
    date: string;
    coverImage?: string;
    readingDuration?: { text?: string };
};

const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export default function Post({ post, isFeatured = false }: { post: PostSummary; isFeatured?: boolean }) {
    return (
        <Link
            href={`/blog/${post.slug}`}
            className={cn(
                "group flex flex-col gap-5 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                isFeatured && "md:grid md:grid-cols-12 md:items-center md:gap-10",
            )}
        >
            <div className={cn("relative aspect-[16/9] overflow-hidden rounded-xl bg-raised", isFeatured && "md:col-span-7")}>
                {post.coverImage && (
                    <Image
                        src={post.coverImage}
                        alt=""
                        fill
                        sizes={isFeatured ? "(min-width: 768px) 60vw, 100vw" : "(min-width: 768px) 33vw, 100vw"}
                        className="object-cover transition-transform duration-500 ease-power3-out group-hover:scale-[1.03]"
                    />
                )}
            </div>
            <div className={cn("flex flex-col gap-3", isFeatured && "md:col-span-5")}>
                <h3
                    className={cn(
                        "font-medium leading-[1.2] tracking-[-0.02em] text-foreground transition-colors duration-150 group-hover:text-soft",
                        isFeatured ? "text-[24px] md:text-[28px]" : "text-[20px]",
                    )}
                >
                    {post.title}
                </h3>
                {post.excerpt && (
                    <p className={cn("leading-[1.55] text-soft", isFeatured ? "text-[18px]" : "line-clamp-3 text-[15px]")}>{post.excerpt}</p>
                )}
                <p className="text-[14px] tabular-nums text-soft">
                    {formatDate(post.date)}
                    {post.readingDuration?.text && ` · ${post.readingDuration.text}`}
                </p>
            </div>
        </Link>
    );
}

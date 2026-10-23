import type { Metadata } from "next";
import { getAllPosts } from "@/lib/mdx";
import Container from "@/sections/Container";
import Post, { type PostSummary } from "@/app/(marketing)/blog/_components/Post";
import { RevealBlur, RevealBlurItem } from "@/components/marketing/reveal";

export const metadata: Metadata = {
    title: "Blog",
    description:
        "Guides, engineering notes and product updates from GebetaMaps - covering geocoding, routing, map tiles and building location features for African markets.",
    alternates: { canonical: "/blog" },
    openGraph: {
        title: "GebetaMaps Blog",
        description: "Guides, engineering notes and product updates on geocoding, routing and map tiles.",
        url: "/blog",
        type: "website",
    },
};

export default async function BlogPage() {
    const posts = getAllPosts() as unknown as PostSummary[];
    const [featured, ...rest] = posts;

    return (
        <main className="py-16 md:py-24">
            <Container className="flex flex-col gap-16 md:gap-20">
                <div className="flex max-w-2xl flex-col gap-4">
                    <h1 className="text-[44px] font-medium leading-[1] tracking-[-0.035em] text-foreground md:text-[64px]">Blog</h1>
                    <p className="text-[18px] leading-[1.5] text-soft">
                        Guides, engineering notes and product updates on maps, geocoding and routing.
                    </p>
                </div>

                {featured && <Post post={featured} isFeatured />}

                {rest.length > 0 && (
                    <section className="flex flex-col gap-8">
                        <h2 className="text-[28px] font-medium tracking-[-0.02em] text-foreground">More articles</h2>
                        <RevealBlur className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                            {rest.map((post) => (
                                <RevealBlurItem key={post.slug}>
                                    <Post post={post} />
                                </RevealBlurItem>
                            ))}
                        </RevealBlur>
                    </section>
                )}
            </Container>
        </main>
    );
}

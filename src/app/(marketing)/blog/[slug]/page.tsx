//@ts-nocheck
import {getAllPosts, getPostBySlug} from '@/lib/mdx';
import Image from 'next/image';
import Link from 'next/link';
import {ArrowLeft} from 'lucide-react';
import Container from "@/sections/Container";
import Post from "@/app/(marketing)/blog/_components/Post";

const SITE_URL = 'https://gebeta.app';

export async function generateMetadata({params}) {
    const {frontMatter} = await getPostBySlug(params.slug);
    const url = `${SITE_URL}/blog/${params.slug}`;
    const image = frontMatter.coverImage ?? '/assets/opengraph-image.png';

    return {
        title: frontMatter.title,
        description: frontMatter.excerpt,
        keywords: frontMatter.tags,
        authors: frontMatter.author ? [{name: frontMatter.author}] : undefined,
        alternates: {canonical: `/blog/${params.slug}`},
        openGraph: {
            type: 'article',
            title: frontMatter.title,
            description: frontMatter.excerpt,
            url,
            publishedTime: frontMatter.date,
            authors: frontMatter.author ? [frontMatter.author] : undefined,
            tags: frontMatter.tags,
            images: [{url: image, alt: frontMatter.title}],
        },
        twitter: {
            card: 'summary_large_image',
            title: frontMatter.title,
            description: frontMatter.excerpt,
            images: [image],
        },
    };
}

export async function generateStaticParams() {
    const posts = getAllPosts();

    return posts.map((post) => ({
        slug: post.slug,
    }));
}

export default async function BlogPost({params}) {
    const {frontMatter, mdxSource} = await getPostBySlug(params.slug);
    const url = `${SITE_URL}/blog/${params.slug}`;

    const articleJsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'BlogPosting',
                '@id': `${url}#article`,
                headline: frontMatter.title,
                description: frontMatter.excerpt,
                datePublished: frontMatter.date,
                dateModified: frontMatter.date,
                image: frontMatter.coverImage
                    ? `${SITE_URL}${frontMatter.coverImage}`
                    : `${SITE_URL}/assets/opengraph-image.png`,
                keywords: frontMatter.tags,
                wordCount: frontMatter.readingDuration?.words,
                inLanguage: 'en',
                author: {
                    '@type': frontMatter.author ? 'Person' : 'Organization',
                    name: frontMatter.author ?? 'GebetaMaps',
                },
                publisher: {'@id': `${SITE_URL}/#organization`},
                mainEntityOfPage: {'@type': 'WebPage', '@id': url},
            },
            {
                '@type': 'BreadcrumbList',
                itemListElement: [
                    {'@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL},
                    {'@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog`},
                    {'@type': 'ListItem', position: 3, name: frontMatter.title, item: url},
                ],
            },
        ],
    };

    const more = getAllPosts().filter((post) => post.slug !== params.slug).slice(0, 3);

    return (
        <main className="py-16 md:py-24">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{__html: JSON.stringify(articleJsonLd)}}
            />
            <Container>
                <article className="mx-auto flex max-w-[720px] flex-col gap-10">
                    <header className="flex flex-col gap-5">
                        <Link href="/blog" className="inline-flex w-fit items-center gap-1 text-[15px] text-soft hover:text-foreground">
                            <ArrowLeft aria-hidden className="size-4"/> All articles
                        </Link>
                        <h1 className="text-balance text-[36px] font-medium leading-[1.08] tracking-[-0.03em] text-foreground md:text-[48px]">
                            {frontMatter.title}
                        </h1>
                        {frontMatter.excerpt && <p className="text-[20px] leading-[1.5] text-soft">{frontMatter.excerpt}</p>}
                        <p className="text-[15px] tabular-nums text-soft">
                            {frontMatter.author && <span className="text-foreground">{frontMatter.author} · </span>}
                            {new Date(frontMatter.date).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}
                            {' · '}{frontMatter.readingDuration.text}
                        </p>
                    </header>

                    {frontMatter.coverImage && (
                        <figure className="-mx-4 flex flex-col gap-2 sm:-mx-12">
                            <Image
                                src={frontMatter.coverImage}
                                alt={frontMatter.title}
                                width={1000}
                                height={600}
                                priority
                                className="h-auto w-full rounded-xl object-cover"
                            />
                            {frontMatter.coverImageCaption && (
                                <figcaption className="text-center text-[14px] text-soft">{frontMatter.coverImageCaption}</figcaption>
                            )}
                        </figure>
                    )}

                    <div>{mdxSource.content}</div>
                </article>

                {more.length > 0 && (
                    <section className="mt-24 flex flex-col gap-8 md:mt-32">
                        <h2 className="text-[28px] font-medium tracking-[-0.02em] text-foreground">Keep reading</h2>
                        <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                            {more.map((post) => <Post key={post.slug} post={post}/>)}
                        </div>
                    </section>
                )}
            </Container>
        </main>
    );
}

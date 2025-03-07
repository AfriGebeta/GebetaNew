//@ts-nocheck
import {getAllPosts, getPostBySlug} from '@/lib/mdx';
import Image from 'next/image';
import Link from 'next/link';
import Footer from "@/app/(marketing)/Footer";
import Navbar from "@/app/(marketing)/Navbar";
import Container from "@/sections/Container";

export async function generateMetadata({params}) {
    const {frontMatter} = await getPostBySlug(params.slug);

    return {
        title: frontMatter.title,
        description: frontMatter.excerpt,
    };
}

export async function generateStaticParams() {
    const posts = getAllPosts();

    return posts.map((post) => ({
        slug: post.slug,
    }));
}

const components = {
    h1: (props) => (
        <h1 className="text-3xl font-bold mt-12 mb-4" {...props} />
    ),
    h2: (props) => (
        <h2 className="text-2xl font-bold mt-10 mb-3" {...props} />
    ),
    h3: (props) => (
        <h3 className="text-xl font-bold mt-8 mb-3" {...props} />
    ),
    p: (props) => (
        <p className="text-xl leading-relaxed mb-6 text-gray-800" {...props} />
    ),
    a: (props) => (
        <a className="text-green-600 underline decoration-1 underline-offset-2 hover:text-green-700" {...props} />
    ),
    ul: (props) => <ul className="list-disc pl-8 mb-6 space-y-2" {...props} />,
    ol: (props) => <ol className="list-decimal pl-8 mb-6 space-y-2" {...props} />,
    li: (props) => <li className="text-xl text-gray-800" {...props} />,
    blockquote: (props) => (
        <blockquote className="border-l-4 border-gray-200 pl-4 italic my-6 text-gray-700" {...props} />
    ),
    code: (props) => (
        <code className="bg-gray-100 rounded px-1 py-0.5 font-mono text-sm" {...props} />
    ),
    pre: (props) => (
        <pre className="bg-gray-100 rounded-md p-4 overflow-x-auto my-6 text-sm" {...props} />
    ),
    img: (props) => (
        <div className="my-8">
            <img className="w-full rounded-md" {...props} />
            {props.alt && <p className="text-center text-gray-500 mt-2 text-sm">{props.alt}</p>}
        </div>
    ),
};

export default async function BlogPost({params}) {
    const {frontMatter, mdxSource} = await getPostBySlug(params.slug);

    return (
        <div className="w-full antialiased pt-32 flex flex-col min-h-screen dark:bg-[#05050a]">
            <Navbar/>
            <Container>
                <article className="max-w-[680px] mx-auto px-4 pt-10 pb-20">
                    <header className="mb-8">
                        <h1 className="text-4xl font-bold leading-tight mb-4">
                            {frontMatter.title}
                        </h1>

                        <div className="text-gray-500 text-lg mb-6">
                            {frontMatter.excerpt}
                        </div>

                        <div className="flex items-center border-b border-gray-100 pb-8">
                            <div>
                                <div className="text-gray-500 text-sm flex items-center space-x-1">
                <span>
                  {new Date(frontMatter.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                  })}
                </span>
                                    <span>•</span>
                                    <span>{frontMatter.readingTime || '5 min read'}</span>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Featured image */}
                    {frontMatter.coverImage && (
                        <div className="mb-10 -mx-4 sm:-mx-12">
                            <Image
                                src={frontMatter.coverImage}
                                alt={frontMatter.title}
                                width={1000}
                                height={600}
                                className="w-full h-auto object-cover"
                            />
                            {frontMatter.coverImageCaption && (
                                <p className="text-center text-gray-500 mt-2 text-sm">
                                    {frontMatter.coverImageCaption}
                                </p>
                            )}
                        </div>
                    )}

                    <div className=" max-w-none">
                        <div className="prose max-w-none">
                            {mdxSource.content}
                        </div>
                    </div>

                    {frontMatter.tags && frontMatter.tags.length > 0 && (
                        <div className="mt-12 pt-6 border-t border-gray-200">
                            <div className="flex flex-wrap gap-2">
                                {frontMatter.tags.map(tag => (
                                    <Link
                                        key={tag}
                                        href={`/blog/tag/${tag}`}
                                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm"
                                    >
                                        {tag}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </article>
            </Container>


            <Footer/>

        </div>
    );
}
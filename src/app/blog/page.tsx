//@ts-nocheck
import Link from 'next/link';
import Image from 'next/image';
import {getAllPosts} from '@/lib/mdx';
import Navbar from "@/app/(marketing)/Navbar";
import Container from "@/sections/Container";
import Post from "@/app/blog/_components/Post";

export const metadata = {
    title: 'Blog | GebetaMaps',
    description: 'Read our latest blog posts',
};

export default async function BlogPage() {
    const posts = getAllPosts();
    const featuredPost = posts[0];
    const regularPosts = posts.slice(1);

    return (
        <div
            className="w-full antialiased pt-32 flex flex-col min-h-screen dark:bg-[#05050a]"
        >
            <Navbar/>

            <div className="flex-1">
                <Container>
                    <div className="flex flex-col items-center justify-center">
                        <h1 className="max-w-xl text-[40px] md:text-[48px] text-[#1B1E2B] dark:text-white text-center leading-60">GebetaMaps
                            Blog</h1>
                        <p className="max-w-lg text-[20px] text-[#62677F] leading-25 mt-[25px] text-center">Stay
                            informed with insightful content on how GebetaMaps solutions are revolutionizing
                            industries.</p>
                    </div>

                    <div className="mt-[120px]">
                        {featuredPost && (
                            <Post post={featuredPost}/>
                        )}
                    </div>

                    <div className="border-b border-gray-200 mb-16"></div>

                    <h2 className="text-2xl font-bold mb-8">Latest Articles</h2>
                    <div className="w-fit flex items-center">
                        {
                            posts.map((post) => (
                                <Post post={post}/>
                            ))
                        }
                    </div>


                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {regularPosts.map((post) => (
                            <div key={post.slug} className="flex flex-col h-full">
                                {/* Post Image */}
                                <Link href={`/blog/${post.slug}`}>
                                    <div className="aspect-[16/9] overflow-hidden rounded-lg mb-4">
                                        {post.coverImage ? (
                                            <Image
                                                src={post.coverImage}
                                                alt={post.title}
                                                width={400}
                                                height={225}
                                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                                <span className="text-gray-400">No image</span>
                                            </div>
                                        )}
                                    </div>
                                </Link>

                                {/* Post Content */}
                                <div className="flex-1 flex flex-col">
                                    <h3 className="text-xl font-bold font-serif mb-2 leading-snug">
                                        <Link href={`/blog/${post.slug}`} className="hover:text-green-600">
                                            {post.title}
                                        </Link>
                                    </h3>

                                    <p className="text-gray-600 mb-4 flex-1 font-serif line-clamp-3">
                                        {post.excerpt}
                                    </p>

                                    <div className="flex items-center mt-auto">
                                        <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden mr-2">
                                            {post.author?.avatar ? (
                                                <Image
                                                    src={post.author.avatar}
                                                    alt={post.author.name}
                                                    width={32}
                                                    height={32}
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div
                                                    className="bg-green-600 w-full h-full flex items-center justify-center text-white font-bold text-xs">
                                                    {post.author?.name?.[0] || 'A'}
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <div
                                                className="text-sm font-medium">{post.author?.name || 'Anonymous'}</div>
                                            <div className="text-gray-500 text-xs flex items-center space-x-1">
                      <span>
                        {new Date(post.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                        })}
                      </span>
                                                <span>•</span>
                                                <span>{post.readingTime || '5 min read'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Container>
            </div>
        </div>
    );
}
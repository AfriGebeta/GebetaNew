import React from 'react'
import Link from "next/link";
import Image from "next/image";

// interface PostProps {
//
// }
export default function Post({post}: any) {
    return (
        <div className="mb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                    <div
                        className="w-fit whitespace-nowrap px-[30px] py-[15px] bg-[#FFF7E8] dark:bg-zinc-900 rounded-[16px] text-[12px] text-[#FFA500] font-extrabold tracking-20 uppercase">FEATURED
                        POST
                    </div>
                    <h1 className="text-3xl md:text-2xl font-bold mt-2 mb-3 leading-tight">
                        <Link href={`/blog/${post.slug}`} className="hover:text-[#ffa500]">
                            {post.title}
                        </Link>
                    </h1>
                    <p className="text-xl text-gray-600 mb-4">{post.excerpt}</p>

                    <div className="flex items-center">
                        <div>
                            <div className="text-gray-500 text-sm flex items-center space-x-1">
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

                <div className="order-first md:order-last">
                    {post.coverImage ? (
                        <Link href={`/blog/${post.slug}`}>
                            <div className="aspect-[16/9] overflow-hidden rounded-lg">
                                <Image
                                    src={post.coverImage}
                                    alt={post.title}
                                    width={600}
                                    height={337}
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                />
                            </div>
                        </Link>
                    ) : (
                        <div
                            className="aspect-[16/9] bg-gray-100 rounded-lg flex items-center justify-center">
                            <span className="text-gray-400">No image</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

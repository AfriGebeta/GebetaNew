//@ts-nocheck
import {getAllPosts} from '@/lib/mdx';
import Container from "@/sections/Container";
import Post from "@/app/(marketing)/blog/_components/Post";

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
                            <Post post={featuredPost} isFeatured={true}/>
                        )}
                    </div>

                    <div className="border-b border-gray-200 mb-16"></div>

                    <h2 className="text-2xl font-bold mb-8">Latest Articles</h2>
                    <div className="w-fit">
                        {
                            posts.map((post) => (
                                <Post post={post}/>
                            ))
                        }
                    </div>
                </Container>
            </div>
        </div>
    );
}
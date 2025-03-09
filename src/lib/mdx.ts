//@ts-nocheck
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import {compileMDX} from 'next-mdx-remote/rsc';
import {MDXComponents} from "@/app/blog/_components/MDXComponent";

const contentDirectory = path.join(process.cwd(), 'src/content');

export async function getPostBySlug(slug) {
    const filePath = path.join(contentDirectory, 'blog', `${slug}.mdx`);
    const fileContent = fs.readFileSync(filePath, 'utf8');

    const { data, content } = matter(fileContent);
    const readingTime = calculateReadingTime(content);

    const { content: mdxContent } = await compileMDX({
        source: content,
        options: {
            mdxOptions: {
                remarkPlugins: [remarkGfm],
                rehypePlugins: [rehypeHighlight],
            },
            parseFrontmatter: false,
        },
        components: MDXComponents
    });

    return {
        frontMatter: {
            ...data,
            slug,
            readingTime,
        },
        mdxSource: { content: mdxContent },
    };
}
function calculateReadingTime(text) {
    const wordsPerMinute = 200;
    const wordCount = text.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    return `${readingTime} min read`;
}

export function getAllPosts() {
    const postsDirectory = path.join(contentDirectory, 'blog');
    const filenames = fs.readdirSync(postsDirectory);

    const posts = filenames
        .filter(file => file.endsWith('.mdx'))
        .map(filename => {
            const filePath = path.join(postsDirectory, filename);
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const { data, content } = matter(fileContent);
            const readingTime = calculateReadingTime(content);

            return {
                ...data,
                slug: filename.replace('.mdx', ''),
                readingTime,
            };
        })
        .sort((post1, post2) => new Date(post2.date) - new Date(post1.date));

    return posts;
}
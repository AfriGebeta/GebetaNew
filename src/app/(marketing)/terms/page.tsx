// import Container from "@/sections/Container";
// import type { Metadata } from "next";
// import { MDXRemote } from 'next-mdx-remote/rsc'
//
// export const metadata: Metadata = {
//     title: "Terms"
// }
//
//
// export default async function Terms() {
//     const res = await fetch("https://mapapi.gebeta.app/terms");
//     const { content } = await res.json();
//
//     return (
//         <Container>
//             <div className="mt-[120px]">
//                 <MDXRemote source={content} />
//             </div>
//         </Container>
//     );
// }

import Container from "@/sections/Container";
import type { Metadata } from "next";
import { MDXRemote } from 'next-mdx-remote/rsc';

// Define the expected response type
interface TermsResponse {
    content: string;
    contentType: string;
    locale: string;
}

export const metadata: Metadata = {
    title: "Terms"
};

export default async function Terms() {
    const res = await fetch("https://mapapi.gebeta.app/terms", {
        next: { revalidate: 3600 }
    });

    if (!res.ok) {
        throw new Error('Failed to fetch terms');
    }

    const data: TermsResponse = await res.json();

    return (
        <Container>
            <article className="mt-[20px] prose prose-lg prose-gray max-w-none
                          prose-headings:font-bold prose-a:text-blue-600
                          prose-strong:text-gray-900">
                <MDXRemote source={data.content} />
            </article>
        </Container>
    );
}

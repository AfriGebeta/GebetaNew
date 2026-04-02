import Container from "@/sections/Container";
import type { Metadata } from "next";
import { MDXRemote } from 'next-mdx-remote/rsc'

export const metadata: Metadata = {
    title: "Terms"
}


export default async function Terms() {
    const res = await fetch("https://mapapi.gebeta.app/terms");
    const { content } = await res.json();

    return (
        <Container>
            <div className="mt-[120px]">
                <MDXRemote source={content} />
            </div>
        </Container>
    );
}

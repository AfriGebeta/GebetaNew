import React from 'react';

export const MDXComponents = {
    // The page already renders the post title as the H1, so a leading "# " in the
    // MDX becomes an H2 to keep one H1 per page and a clean heading hierarchy.
    h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
        <h2 {...props} className="mb-4 mt-12 text-[28px] font-medium leading-[1.2] tracking-[-0.02em] text-foreground" />
    ),
    h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
        <h2 {...props} className="mb-4 mt-12 text-[26px] font-medium leading-[1.2] tracking-[-0.02em] text-foreground" />
    ),
    h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
        <h3 {...props} className="mb-3 mt-8 text-[20px] font-medium leading-[1.3] text-foreground" />
    ),
    p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
        <p {...props} className="mb-5 text-[18px] leading-[1.65] text-foreground" />
    ),
    ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
        <ul {...props} className="mb-5 list-disc space-y-2 pl-6 text-[18px] leading-[1.6] text-foreground marker:text-subtle" />
    ),
    ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
        <ol {...props} className="mb-5 list-decimal space-y-2 pl-6 text-[18px] leading-[1.6] text-foreground marker:text-subtle" />
    ),
    li: (props: React.HTMLAttributes<HTMLLIElement>) => <li {...props} className="pl-1" />,
    blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
        <blockquote {...props} className="my-8 rounded-lg bg-raised px-6 py-5 text-[20px] leading-[1.5] text-foreground [&>p]:mb-0" />
    ),
    a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
        <a {...props} className="text-foreground underline decoration-foreground/30 decoration-1 underline-offset-4 hover:decoration-foreground" />
    ),
    code: (props: React.HTMLAttributes<HTMLElement>) => (
        <code {...props} className="rounded bg-raised px-1.5 py-0.5 font-mono text-[0.88em] text-foreground [pre_&]:bg-transparent [pre_&]:p-0 [pre_&]:text-background" />
    ),
    pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
        <pre {...props} className="my-6 overflow-x-auto rounded-lg bg-foreground p-5 text-[14px] leading-[1.6] text-background" />
    ),
    strong: (props: React.HTMLAttributes<HTMLElement>) => <strong {...props} className="font-semibold text-foreground" />,
    em: (props: React.HTMLAttributes<HTMLElement>) => <em {...props} className="italic" />,
    table: (props: React.TableHTMLAttributes<HTMLTableElement>) => (
        <div className="my-6 overflow-x-auto rounded-lg shadow-card">
            <table {...props} className="w-full border-collapse text-[15px]" />
        </div>
    ),
    th: (props: React.ThHTMLAttributes<HTMLTableCellElement>) => (
        <th {...props} className="border-b border-line-strong bg-raised px-4 py-2.5 text-left font-medium text-foreground" />
    ),
    td: (props: React.TdHTMLAttributes<HTMLTableCellElement>) => (
        <td {...props} className="border-b border-border px-4 py-2.5 text-foreground" />
    ),
    img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
        // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
        <img {...props} className="my-8 w-full rounded-lg object-cover object-center" />
    ),
};

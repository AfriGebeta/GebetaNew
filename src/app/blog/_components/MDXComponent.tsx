import React from 'react';

export const MDXComponents = {
    h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
        <h1 {...props} className="text-3xl font-bold text-white mb-4 mt-6" />
    ),
    h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
        <h2 {...props} className="text-2xl font-semibold text-white mb-3 mt-5" />
    ),
    h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
        <h3 {...props} className="text-xl font-medium text-white mb-2 mt-4" />
    ),
    p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
        <p {...props} className="text-gray-300 mb-4 leading-relaxed" />
    ),
    ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
        <ul {...props} className="list-disc list-inside mb-4 text-gray-300" />
    ),
    ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
        <ol {...props} className="list-decimal list-inside mb-4 text-gray-300" />
    ),
    li: (props: React.HTMLAttributes<HTMLLIElement>) => (
        <li {...props} className="mb-1" />
    ),
    blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
        <blockquote {...props} className="border-l-4 border-gray-500 pl-4 italic text-gray-400 mb-4" />
    ),
    a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
        <a {...props} className="text-blue-400 hover:text-blue-300 underline" />
    ),
    code: (props: React.HTMLAttributes<HTMLElement>) => (
        <code {...props} className="bg-gray-800 rounded px-1 py-0.5 text-sm text-pink-400" />
    ),
    pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
        <pre {...props} className="bg-gray-800 rounded-lg p-4 mb-4 overflow-x-auto" />
    ),
    strong: (props: React.HTMLAttributes<HTMLElement>) => (
        <strong {...props} className="font-bold text-white" />
    ),
    em: (props: React.HTMLAttributes<HTMLElement>) => (
        <em {...props} className="italic text-gray-300" />
    ),
    table: (props: React.TableHTMLAttributes<HTMLTableElement>) => (
        <table {...props} className="w-full border-collapse mb-4" />
    ),
    th: (props: React.ThHTMLAttributes<HTMLTableCellElement>) => (
        <th {...props} className="border border-gray-700 px-4 py-2 bg-gray-800 text-white" />
    ),
    td: (props: React.TdHTMLAttributes<HTMLTableCellElement>) => (
        <td {...props} className="border border-gray-700 px-4 py-2 text-gray-300" />
    ),
};
import { source } from "@/lib/source";
import { getMDXComponents } from "@/mdx-components";
import { MDXRemote } from "next-mdx-remote/rsc";

export default async function Page({
  params,
}: {
  params: { slug?: string[] };
}) {
  const slug = params.slug?.join("/") || "index";
  const page = await source.getPage(slug);

  if (!page) {
    return <p>Page not found</p>;
  }

  return (
    <article>
      <h1>{page.frontmatter.title}</h1>
      <MDXRemote source={page.content} components={getMDXComponents()} />
    </article>
  );
}

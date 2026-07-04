import { prisma } from "@/lib/prisma";
import { BlogCard } from "@/components/blog";
import { Navbar, Footer } from "@/components/layout";
import { BlogFilters } from "./BlogFilters";
import { Prisma } from "@prisma/client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "Thoughts on software engineering, technology, and building things.",
};

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ category?: string; q?: string; tag?: string }>;
}

export default async function BlogPage({ searchParams }: Props) {
  const { category, q, tag } = await searchParams;

  let posts;

  if (q?.trim()) {
    // Full-text search via raw SQL
    posts = await prisma.$queryRaw<
      Array<{
        id: string;
        title: string;
        slug: string;
        excerpt: string;
        content: string;
        cover_image: string | null;
        tags: string[];
        category: string;
        status: string;
        published_at: Date | null;
        created_at: Date;
        updated_at: Date;
      }>
    >`
      SELECT * FROM blog_posts
      WHERE status = 'PUBLISHED'
        AND (${category ?? null}::text IS NULL OR category = ${category ?? ""}::text)
        AND (${tag ?? null}::text IS NULL OR ${tag ?? ""}::text = ANY(tags))
        AND to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(excerpt,'') || ' ' || coalesce(content,''))
            @@ plainto_tsquery('simple', ${q.trim()})
      ORDER BY ts_rank(
        to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(excerpt,'') || ' ' || coalesce(content,'')),
        plainto_tsquery('simple', ${q.trim()})
      ) DESC
    `;
    // Map snake_case columns to camelCase
    posts = posts.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      content: p.content,
      coverImage: p.cover_image,
      tags: p.tags,
      category: p.category,
      status: p.status,
      publishedAt: p.published_at,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    }));
  } else {
    const where: Prisma.BlogPostWhereInput = { status: "PUBLISHED" };
    if (category) where.category = category;
    if (tag) where.tags = { has: tag };

    posts = await prisma.blogPost.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
  }

  const categoryList = await prisma.blogCategory.findMany({
    orderBy: { sortOrder: "asc" },
    select: { name: true },
  });
  const categoryNames = categoryList.map((c) => c.name);

  const tsSetting = await prisma.siteSetting.findUnique({
    where: { key: "showBlogTimestamp" },
  });
  const showTimestamp = tsSetting?.value !== "false";

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-serif text-5xl md:text-6xl mb-4">Blog</h1>
          <p className="text-xl text-muted mb-16 max-w-2xl">
            Thoughts on software engineering, technology, and building things
            that matter.
          </p>

          <BlogFilters categories={categoryNames} />

          {posts.length === 0 ? (
            <p className="text-muted">
              {q ? `No posts found for "${q}".` : "No posts published yet."}
            </p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <BlogCard
                  key={post.id}
                  slug={post.slug}
                  title={post.title}
                  excerpt={post.excerpt}
                  content={post.content}
                  coverImage={post.coverImage}
                  tags={post.tags}
                  category={post.category}
                  publishedAt={
                    showTimestamp && post.publishedAt
                      ? new Date(post.publishedAt).toISOString()
                      : undefined
                  }
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

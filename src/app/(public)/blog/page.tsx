import { prisma } from "@/lib/prisma";
import { BlogCard } from "@/components/blog";
import { Navbar, Footer } from "@/components/layout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "Thoughts on software engineering, technology, and building things.",
};

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const [posts, tsSetting] = await Promise.all([
    prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
    }),
    prisma.siteSetting.findUnique({ where: { key: "showBlogTimestamp" } }),
  ]);
  const showTimestamp = tsSetting?.value !== "false";

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">Blog</h1>
          <p className="text-xl text-muted mb-16 max-w-2xl">
            Thoughts on software engineering, technology, and building things
            that matter.
          </p>

          {posts.length === 0 ? (
            <p className="text-muted">No posts published yet.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <BlogCard
                  key={post.id}
                  slug={post.slug}
                  title={post.title}
                  excerpt={post.excerpt}
                  coverImage={post.coverImage}
                  tags={post.tags}
                  publishedAt={showTimestamp ? post.publishedAt?.toISOString() : undefined}
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

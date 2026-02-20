import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { BlogRenderer } from "@/components/blog";
import { Navbar, Footer } from "@/components/layout";
import { Badge } from "@/components/ui";
import { Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug } });

  if (!post) return { title: "Post Not Found" };

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      images: post.coverImage ? [post.coverImage] : [],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [post, tsSetting] = await Promise.all([
    prisma.blogPost.findUnique({ where: { slug, status: "PUBLISHED" } }),
    prisma.siteSetting.findUnique({ where: { key: "showBlogTimestamp" } }),
  ]);
  const showTimestamp = tsSetting?.value !== "false";

  if (!post) notFound();

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-32 pb-20 px-6">
        <article className="max-w-3xl mx-auto">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground mb-8"
          >
            <ArrowLeft size={16} />
            Back to Blog
          </Link>

          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="accent">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            {post.title}
          </h1>

          {showTimestamp && post.publishedAt && (
            <div className="flex items-center gap-2 text-sm text-muted mb-12">
              <Calendar size={14} />
              {post.publishedAt.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          )}

          {post.coverImage && (
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full rounded-2xl mb-12"
            />
          )}

          <BlogRenderer content={post.content} />
        </article>
      </main>
      <Footer />
    </>
  );
}

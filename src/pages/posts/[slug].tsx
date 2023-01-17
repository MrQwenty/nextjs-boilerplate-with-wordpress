import type { GetStaticPaths, GetStaticProps } from 'next';
import ErrorPage from 'next/error';
import { useRouter } from 'next/router';

import { PostLayout } from '@/components/Layout';
import Link from '@/components/Link';
import PostBody from '@/components/PostBody';
import { getAllPostsWithSlug, getPostAndMorePosts } from '@/lib/api';

type PostProps = {
  post: {
    title: string;
    content: string;
    slug: string;
  };
  posts: {
    edges: {
      node: {
        title: string;
        slug: string;
      };
    }[];
  };
};

export default function Post({ post, posts }: PostProps) {
  const router = useRouter();
  const morePosts = posts?.edges;

  if (!router.isFallback && !post?.slug) {
    return <ErrorPage statusCode={404} />;
  }

  return (
    <>
      {router.isFallback ? (
        <h1>Loading…</h1>
      ) : (
        <PostLayout title={post.title}>
          <Link href="/">Back to home</Link>
          <article>
            <h1>{post.title}</h1>
            <PostBody content={post.content} />
          </article>
          {morePosts.length > 0 && (
            <section>
              <h2>More Posts</h2>
              <ul>
                {morePosts.map((iPost) => (
                  <li key={iPost.node.slug}>
                    <Link href={`/posts/${iPost.node.slug}`}>
                      {iPost.node.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </PostLayout>
      )}
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
  previewData,
}: any) => {
  const data = await getPostAndMorePosts(params?.slug, preview, previewData);

  return {
    props: {
      preview,
      post: data.post,
      posts: data.posts,
    },
    revalidate: 10,
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const allPosts = await getAllPostsWithSlug();

  return {
    paths: allPosts.edges.map(({ node }: any) => `/posts/${node.slug}`) || [],
    fallback: true,
  };
};

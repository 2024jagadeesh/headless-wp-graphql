import { GraphQLClient, gql } from "graphql-request";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  const endpoint = process.env.WORDPRESS_GRAPHQL_URL;
  const client = new GraphQLClient(endpoint);

  try {
    // ✅ If an ID is provided → get one post
    if (id) {
      const query = gql`
        query PostById($id: ID!) {
          post(id: $id, idType: ID) {
            id # global ID
            databaseId # numeric ID (required for updatePost)
            title
            content
          }
        }
      `;
      const data = await client.request(query, { id });

      if (!data?.post) {
        return new Response(
          JSON.stringify({ post: null, error: "Post not found" }),
          { status: 200 }
        );
      }

      return new Response(JSON.stringify({ post: data.post }), { status: 200 });
    }

    // ✅ No ID → get all posts
    const allQuery = gql`
      query AllPosts {
        posts(first: 50) {
          nodes {
            id
            databaseId
            title
            slug
          }
        }
      }
    `;

    const data = await client.request(allQuery);

    return new Response(JSON.stringify({ posts: data?.posts?.nodes || [] }), {
      status: 200,
    });
  } catch (error) {
    console.error("❌ get-posts error:", error);

    return new Response(
      JSON.stringify({
        error: error.message,
        details: error.response || null,
      }),
      { status: 500 }
    );
  }
}

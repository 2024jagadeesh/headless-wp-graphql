import { GraphQLClient, gql } from "graphql-request";
import { getAccessToken } from "../../../lib/wpAuth";

export async function POST(req) {
  try {
    const { title, content } = await req.json();

    // 🔥 ALWAYS get fresh token
    const token = await getAccessToken();
    console.log("TOKEN USED:", token);

    const endpoint = process.env.WORDPRESS_GRAPHQL_URL;

    const client = new GraphQLClient(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const mutation = gql`
      mutation CreatePost($title: String!, $content: String!) {
        createPost(
          input: { title: $title, content: $content, status: PUBLISH }
        ) {
          post {
            id
            title
            slug
          }
        }
      }
    `;

    const data = await client.request(mutation, { title, content });

    return new Response(JSON.stringify({ post: data.createPost.post }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ create-post error:", error);

    return new Response(
      JSON.stringify({
        error: error.message,
        details: error.response || null,
      }),
      { status: 500 }
    );
  }
}

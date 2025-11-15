import { GraphQLClient, gql } from "graphql-request";
import { getAccessToken } from "../../../lib/wpAuth";

export async function POST(req) {
  try {
    const { id, title, content } = await req.json();

    const numericId = Number(id);

    const token = await getAccessToken();

    const client = new GraphQLClient(process.env.WORDPRESS_GRAPHQL_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const mutation = gql`
      mutation UpdatePost($id: ID!, $title: String!, $content: String!) {
        updatePost(
          input: { id: $id, title: $title, content: $content, status: PUBLISH }
        ) {
          post {
            id
            databaseId
            title
            content
          }
        }
      }
    `;

    const result = await client.request(mutation, {
      id: numericId,
      title,
      content,
    });

    return new Response(JSON.stringify({ post: result.updatePost.post }), {
      status: 200,
    });
  } catch (error) {
    console.error("❌ UPDATE ERROR:", error);

    return new Response(
      JSON.stringify({
        error: error.message,
        details: error.response || null,
      }),
      { status: 500 }
    );
  }
}

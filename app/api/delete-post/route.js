import { GraphQLClient, gql } from "graphql-request";
import { getAccessToken } from "@/lib/wpAuth";

export async function POST(req) {
  try {
    const { id } = await req.json();

    if (!id) {
      return new Response(JSON.stringify({ error: "ID is required" }), {
        status: 400,
      });
    }

    const numericId = Number(id);

    const token = await getAccessToken();

    const client = new GraphQLClient(process.env.WORDPRESS_GRAPHQL_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const mutation = gql`
      mutation DeletePost($id: ID!) {
        deletePost(input: { id: $id }) {
          deletedId
        }
      }
    `;

    const result = await client.request(mutation, { id: numericId });

    return new Response(JSON.stringify(result.deletePost), {
      status: 200,
    });
  } catch (error) {
    console.error("❌ DELETE ERROR:", error);

    return new Response(
      JSON.stringify({
        error: error.message,
        details: error.response?.errors || null,
      }),
      { status: 500 }
    );
  }
}

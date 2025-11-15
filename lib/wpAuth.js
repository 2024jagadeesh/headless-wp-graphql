import fs from "fs";
import path from "path";
import { GraphQLClient, gql } from "graphql-request";

const tokenFilePath = path.resolve("./wp-token.json");

let currentToken = null;

// load token from file if exists
function loadTokenFromFile() {
  try {
    if (fs.existsSync(tokenFilePath)) {
      const data = JSON.parse(fs.readFileSync(tokenFilePath, "utf8"));
      if (data?.token) {
        currentToken = data.token;
        console.log("✅ Loaded WordPress token from file");
      }
    }
  } catch (err) {
    console.warn("⚠️ Could not load token:", err.message);
  }
}

function saveTokenToFile(token) {
  try {
    fs.writeFileSync(tokenFilePath, JSON.stringify({ token }, null, 2));
    console.log("💾 Saved new WordPress token");
  } catch (err) {
    console.warn("⚠️ Failed to save token:", err.message);
  }
}

loadTokenFromFile();

export async function getAccessToken() {
  if (currentToken) return currentToken;

  const endpoint = process.env.WORDPRESS_GRAPHQL_URL;

  const refreshMutation = gql`
    mutation RefreshToken($refreshToken: String!) {
      refreshJwtAuthToken(input: { jwtRefreshToken: $refreshToken }) {
        authToken
      }
    }
  `;

  try {
    const client = new GraphQLClient(endpoint);
    const data = await client.request(refreshMutation, {
      refreshToken: process.env.WORDPRESS_REFRESH_TOKEN,
    });

    const newToken = data.refreshJwtAuthToken.authToken;
    currentToken = newToken;
    saveTokenToFile(newToken);
    console.log("✅ Refreshed WordPress token");
    return newToken;
  } catch (err) {
    console.warn("⚠️ Refresh failed, logging in...");

    const loginMutation = gql`
      mutation Login($username: String!, $password: String!) {
        login(input: { username: $username, password: $password }) {
          authToken
        }
      }
    `;

    const client = new GraphQLClient(endpoint);
    const data = await client.request(loginMutation, {
      username: process.env.WORDPRESS_USERNAME,
      password: process.env.WORDPRESS_PASSWORD,
    });

    const newToken = data.login.authToken;
    currentToken = newToken;
    saveTokenToFile(newToken);
    console.log("✅ Logged in and got new token");
    return newToken;
  }
}

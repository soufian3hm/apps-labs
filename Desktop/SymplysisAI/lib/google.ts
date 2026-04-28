import { createRemoteJWKSet, jwtVerify } from "jose";

const GOOGLE_JWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));
const GOOGLE_ISSUERS = ["https://accounts.google.com", "accounts.google.com"];

export interface GoogleProfile {
  googleId: string;
  email: string;
  name: string;
}

export async function verifyGoogleCredential(credential: string): Promise<GoogleProfile> {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!clientId) {
    throw new Error("Google sign-in is not configured.");
  }

  const { payload } = await jwtVerify(credential, GOOGLE_JWKS, {
    audience: clientId,
    issuer: GOOGLE_ISSUERS,
  });

  if (!payload.sub || !payload.email) {
    throw new Error("Google did not return a valid profile.");
  }

  if (payload.email_verified === false) {
    throw new Error("Your Google email must be verified before it can be used here.");
  }

  return {
    googleId: String(payload.sub),
    email: String(payload.email).toLowerCase(),
    name: payload.name ? String(payload.name) : String(payload.email).split("@")[0],
  };
}

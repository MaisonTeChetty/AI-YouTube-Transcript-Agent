// Keep the old spelling as a fallback for existing deployments.
const issuer = process.env.CLERK_JWT_ISSUER_DOMAIN || process.env.CLERK_ISSUE_URL;
if (!issuer){
    throw new Error("Set CLERK_JWT_ISSUER_DOMAIN in the Convex deployment environment")
}


const authConfig = {
    providers: [
      {
        domain: issuer,
        applicationID: "convex",
      },
    ]
  };

  export default authConfig

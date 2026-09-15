"use server";

import { currentUser } from "@clerk/nextjs/server";
import { getSchematicClient } from "@/lib/schematic";

export async function getTemporaryAccessToken() {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  const response = await getSchematicClient().accesstokens.issueTemporaryAccessToken({
    resourceType: "company",
    lookup: {
        id:user.id
    }
  })

  return response.data.token
}
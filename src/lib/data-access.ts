import { shouldUseApiClient } from "./api-config";
import { api } from "./api-client";
import prisma from "./prisma";

export async function withDataSource<T>(
  apiMethod: () => Promise<T>,
  prismaMethod: () => Promise<T>,
): Promise<T> {
  if (shouldUseApiClient()) {
    return apiMethod();
  }
  return prismaMethod();
}

export { shouldUseApiClient, api, prisma };

import { initEdgeStore } from "@edgestore/server";
import { createEdgeStoreNextHandler } from "@edgestore/server/adapters/next/app";

const es = initEdgeStore.create();

export const edgeStoreRouter = es.router({
  careerImages: es.imageBucket({
    maxSize: 1024 * 1024 * 4, // 4MB
  }),
});

export const handler = createEdgeStoreNextHandler({ router: edgeStoreRouter });
export type EdgeStoreRouter = typeof edgeStoreRouter;

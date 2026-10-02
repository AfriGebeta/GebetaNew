"use client";

import { createEdgeStoreProvider } from "@edgestore/react";
import type { EdgeStoreRouter } from "./edgestore-career";

const { EdgeStoreProvider, useEdgeStore } =
  createEdgeStoreProvider<EdgeStoreRouter>();

export { EdgeStoreProvider, useEdgeStore };

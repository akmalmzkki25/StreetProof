import "server-only";

import {
  createStorage,
  storageConfigFromEnv,
  type Storage,
} from "@streetproof/db/storage";

let shared: Storage | undefined;

export function getStorage() {
  shared ??= createStorage(storageConfigFromEnv());
  return shared;
}

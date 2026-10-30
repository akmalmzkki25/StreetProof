import "./migrate";
import { createStorage, storageConfigFromEnv } from "../src/storage";

// What a fresh deployment needs before the app starts. Safe to run every time.
const storage = createStorage(storageConfigFromEnv());
await storage.ensureBucket();
console.log(`Bucket "${storage.bucket}" is ready.`);

import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { timestamps, users } from "./users";

export const apiKeys = pgTable("api_keys", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  provider: text("provider", { enum: ["openai", "anthropic"] }).notNull(),
  encryptedKey: text("encrypted_key").notNull(),
  keyPrefix: text("key_prefix").notNull(),
  iv: text("iv").notNull(),
  authTag: text("auth_tag").notNull(),
  createdById: text("created_by_id").references(() => users.id),
  isActive: boolean("is_active").default(true).notNull(),
  lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  ...timestamps,
});

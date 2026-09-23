import { sql } from "drizzle-orm";
import {
  index,
  integer,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const adoptions = sqliteTable(
  "adoptions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    benchId: integer("bench_id").notNull().unique(),
    donorName: text("donor_name").notNull(),
    donorEmail: text("donor_email").notNull(),
    dedication: text("dedication").notNull().default(""),
    termYears: integer("term_years").notNull(),
    termMonths: integer("term_months").notNull().default(0),
    status: text("status").notNull().default("approved"),
    confirmationCode: text("confirmation_code"),
    renewalRequested: integer("renewal_requested", { mode: "boolean" })
      .notNull()
      .default(false),
    adoptedAt: text("adopted_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    adoptedUntil: text("adopted_until").notNull(),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_adoptions_status").on(table.status),
    index("idx_adoptions_adopted_until").on(table.adoptedUntil),
    index("idx_adoptions_email_created").on(table.donorEmail, table.adoptedAt),
  ],
);

export const benchLocations = sqliteTable("bench_locations", {
  benchId: integer("bench_id").primaryKey(),
  mapX: real("map_x").notNull(),
  mapY: real("map_y").notNull(),
  layoutVersion: integer("layout_version").notNull().default(1),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const waitlistEntries = sqliteTable(
  "waitlist_entries",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    benchId: integer("bench_id").notNull(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    status: text("status").notNull().default("waiting"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("idx_waitlist_bench_email").on(table.benchId, table.email),
    index("idx_waitlist_bench_status_created").on(
      table.benchId,
      table.status,
      table.createdAt,
    ),
  ],
);

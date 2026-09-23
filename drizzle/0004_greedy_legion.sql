CREATE TABLE `waitlist_entries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`bench_id` integer NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`status` text DEFAULT 'waiting' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_waitlist_bench_email` ON `waitlist_entries` (`bench_id`,`email`);--> statement-breakpoint
CREATE INDEX `idx_waitlist_bench_status_created` ON `waitlist_entries` (`bench_id`,`status`,`created_at`);
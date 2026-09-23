CREATE TABLE `adoptions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`bench_id` integer NOT NULL,
	`donor_name` text NOT NULL,
	`donor_email` text NOT NULL,
	`dedication` text DEFAULT '' NOT NULL,
	`term_years` integer NOT NULL,
	`adopted_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`adopted_until` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `adoptions_bench_id_unique` ON `adoptions` (`bench_id`);
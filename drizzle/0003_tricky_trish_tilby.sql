CREATE TABLE `bench_locations` (
	`bench_id` integer PRIMARY KEY NOT NULL,
	`map_x` real NOT NULL,
	`map_y` real NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);

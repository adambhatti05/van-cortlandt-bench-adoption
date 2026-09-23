ALTER TABLE `adoptions` ADD `status` text DEFAULT 'approved' NOT NULL;--> statement-breakpoint
ALTER TABLE `adoptions` ADD `confirmation_code` text;--> statement-breakpoint
ALTER TABLE `adoptions` ADD `renewal_requested` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `adoptions` ADD `updated_at` text DEFAULT '1970-01-01T00:00:00.000Z' NOT NULL;--> statement-breakpoint
CREATE INDEX `idx_adoptions_status` ON `adoptions` (`status`);--> statement-breakpoint
CREATE INDEX `idx_adoptions_adopted_until` ON `adoptions` (`adopted_until`);--> statement-breakpoint
CREATE INDEX `idx_adoptions_email_created` ON `adoptions` (`donor_email`,`adopted_at`);

CREATE TABLE `assets` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`category` text,
	`image_url` text,
	`status` text DEFAULT 'Active',
	`campus` text DEFAULT 'RAMA_9',
	`is_returnable` integer DEFAULT true,
	`stock` integer DEFAULT 1,
	`serial_number` text,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `borrow_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`asset_id` text NOT NULL,
	`borrower_name` text NOT NULL,
	`borrower_email` text NOT NULL,
	`return_code` text NOT NULL,
	`borrow_date` integer NOT NULL,
	`expected_return_date` integer,
	`return_date` integer,
	`status` text DEFAULT 'Borrowed',
	`staff_name` text,
	FOREIGN KEY (`asset_id`) REFERENCES `assets`(`id`) ON UPDATE no action ON DELETE no action
);

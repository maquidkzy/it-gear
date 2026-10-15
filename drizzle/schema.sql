CREATE TABLE IF NOT EXISTS `assets` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`category` text,
	`image_url` text,
	`status` text DEFAULT 'Active',
	`campus` text DEFAULT 'RAMA_9',
	`is_returnable` integer DEFAULT 1,
	`stock` integer DEFAULT 1,
	`serial_number` text,
	`created_at` integer,
	`updated_at` integer
);

CREATE TABLE IF NOT EXISTS `borrow_history` (
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

CREATE TABLE IF NOT EXISTS `staff` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`password` text NOT NULL,
	`created_at` integer
);

CREATE UNIQUE INDEX IF NOT EXISTS `staff_password_unique` ON `staff` (`password`);

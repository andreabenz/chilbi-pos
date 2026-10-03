CREATE TABLE `bills` (
	`receipt_number` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_number` integer NOT NULL,
	`user_id` integer,
	`terminal_id` text DEFAULT 'Chilbi Kasse #1' NOT NULL,
	`opened_at` integer DEFAULT (unixepoch()) NOT NULL,
	`closed_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`order_number`) REFERENCES `orders`(`order_number`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `bills_orderNumber_unique` ON `bills` (`order_number`);--> statement-breakpoint
CREATE TABLE `categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `extras` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`price` integer NOT NULL,
	`icon_url` text
);
--> statement-breakpoint
CREATE TABLE `menu_item_extras` (
	`item_id` integer NOT NULL,
	`extra_id` integer NOT NULL,
	PRIMARY KEY(`item_id`, `extra_id`),
	FOREIGN KEY (`item_id`) REFERENCES `menu_items`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`extra_id`) REFERENCES `extras`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `menu_item_variants` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`item_id` integer NOT NULL,
	`name` text,
	`price` integer NOT NULL,
	FOREIGN KEY (`item_id`) REFERENCES `menu_items`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `menu_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`category_id` integer NOT NULL,
	`name` text NOT NULL,
	`icon_url` text,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `order_item_extras` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_item_id` integer NOT NULL,
	`extra_id` integer NOT NULL,
	FOREIGN KEY (`order_item_id`) REFERENCES `order_item`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`extra_id`) REFERENCES `extras`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `order_item` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_number` integer NOT NULL,
	`menu_item_id` integer NOT NULL,
	`variant_id` integer NOT NULL,
	`amount` integer DEFAULT 1 NOT NULL,
	`unit_price` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`order_number`) REFERENCES `orders`(`order_number`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`variant_id`) REFERENCES `menu_item_variants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`order_number` integer PRIMARY KEY AUTOINCREMENT NOT NULL
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`receipt_number` integer NOT NULL,
	`method` text DEFAULT 'cash' NOT NULL,
	`amount` integer NOT NULL,
	`tip_amount` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`receipt_number`) REFERENCES `bills`(`receipt_number`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`cevi_name` text NOT NULL,
	`role` text DEFAULT 'staff'
);

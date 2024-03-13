CREATE TABLE IF NOT EXISTS "swap_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"address" varchar(44),
	"token_from_address" varchar(44) NOT NULL,
	"token_to_address" varchar(44) NOT NULL,
	"amount_from" numeric NOT NULL,
	"amount_to" numeric NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "token_list_revalidations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fetched_tokens_count" integer NOT NULL,
	"added_tokens_count" integer NOT NULL,
	"removed_tokens_count" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tokens" (
	"address" varchar(44) PRIMARY KEY NOT NULL,
	"chain_id" smallint NOT NULL,
	"decimals" smallint NOT NULL,
	"name" text NOT NULL,
	"symbol" text NOT NULL,
	"logo_url" text,
	"tags" text[] DEFAULT array[]::text[] NOT NULL,
	"extensions" jsonb,
	"removed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"address" varchar(44) PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "swap_requests" ADD CONSTRAINT "swap_requests_address_users_address_fk" FOREIGN KEY ("address") REFERENCES "users"("address") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "swap_requests" ADD CONSTRAINT "swap_requests_token_from_address_tokens_address_fk" FOREIGN KEY ("token_from_address") REFERENCES "tokens"("address") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "swap_requests" ADD CONSTRAINT "swap_requests_token_to_address_tokens_address_fk" FOREIGN KEY ("token_to_address") REFERENCES "tokens"("address") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

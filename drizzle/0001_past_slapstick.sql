DO $$ BEGIN
 CREATE TYPE "catpoint_reward_error_reason" AS ENUM('MAX_RETRIES_EXCEEDED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "catpoint_reward_status" AS ENUM('PENDING', 'SUCCESSFUL', 'ERROR');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "catpoints_rewards" (
	"swap_tx_signature" varchar(90) PRIMARY KEY NOT NULL,
	"tx_signature" varchar(90),
	"error_reason" "catpoint_reward_error_reason",
	"status" "catpoint_reward_status" DEFAULT 'PENDING' NOT NULL,
	"amount" numeric NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "swap_requests" ADD COLUMN "tx_signature" varchar(90);--> statement-breakpoint
ALTER TABLE "token_list_revalidations" ADD COLUMN "swap_request_tx_signature" varchar(90);--> statement-breakpoint
--> statement-breakpoint
ALTER TABLE "swap_requests" ADD CONSTRAINT "swap_requests_tx_signature_unique" UNIQUE("tx_signature");--> statement-breakpoint

DO $$ BEGIN
 ALTER TABLE "token_list_revalidations" ADD CONSTRAINT "token_list_revalidations_swap_request_tx_signature_swap_requests_tx_signature_fk" FOREIGN KEY ("swap_request_tx_signature") REFERENCES "swap_requests"("tx_signature") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

UPDATE "swap_requests" set "tx_signature" = CONCAT('autogen_', md5(random()::text));

ALTER TABLE "token_list_revalidations" ADD CONSTRAINT "token_list_revalidations_swap_request_tx_signature_unique" UNIQUE("swap_request_tx_signature");
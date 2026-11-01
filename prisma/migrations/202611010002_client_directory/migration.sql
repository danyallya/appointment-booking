-- Store normalized directory values consistently before adding client writes.
ALTER TABLE "Client"
  ADD CONSTRAINT "Client_name_nonempty_trimmed"
  CHECK (length("name") > 0 AND "name" = btrim("name")),
  ADD CONSTRAINT "Client_email_lower_trimmed"
  CHECK ("email" = lower(btrim("email"))),
  ADD CONSTRAINT "Client_phone_normalized"
  CHECK ("phone" IS NULL OR "phone" ~ '^\+?[0-9]{7,15}$');

CREATE INDEX "Client_name_idx" ON "Client"("name");

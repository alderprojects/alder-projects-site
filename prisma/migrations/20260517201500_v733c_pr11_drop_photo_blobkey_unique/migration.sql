-- v7.3.3-C-PR1.1: drop global unique index on Photo.blobKey.
--
-- Problem: blobKey is content-addressed (sha256 of post-processed
-- image bytes). The global unique made same-anon re-upload of the
-- same photo fail with a unique-constraint violation, surfacing in
-- the upload route as `photo_create_failed` (HTTP 409) with no
-- EventLog row (the failure happens before logEvent).
--
-- Fix: drop the global unique. Two different anon visitors uploading
-- the same content are now allowed to have separate Photo rows.
-- Same-anon re-upload of same bytes is handled at the application
-- layer (find-or-create on (visitorAnonId, blobKey), with extraction
-- triggered only if no prior successful VisionExtraction exists).

DROP INDEX IF EXISTS "Photo_blobKey_key";

-- We DELIBERATELY do not add a per-anon partial unique index here:
--   (1) Prisma can't express it natively (partial unique on a non-
--       nullable column with a where clause requires raw SQL +
--       drift workarounds we hit in v7.3.3-B).
--   (2) The application-layer find-or-create in /api/photos/upload
--       is sufficient for beta scale (single sequential POST per
--       photo, no concurrent uploads of the same bytes from the
--       same anon).
--   (3) If concurrent same-content uploads ever produce duplicate
--       rows in practice, anon-cleanup-cron sweeps unconfirmed
--       blobs and we can revisit.

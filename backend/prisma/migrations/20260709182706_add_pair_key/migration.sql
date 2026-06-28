-- Add the key as nullable first so this migration also works for existing data.
ALTER TABLE "Conversation" ADD COLUMN "pairKey" TEXT;

-- A private conversation is identified by the two participant IDs in stable order.
UPDATE "Conversation" AS conversation
SET "pairKey" = pair."pairKey"
FROM (
  SELECT
    "conversationId",
    string_agg("userId", ':' ORDER BY "userId") AS "pairKey"
  FROM "ConversationParticipant"
  GROUP BY "conversationId"
) AS pair
WHERE pair."conversationId" = conversation.id;

-- Do not silently assign arbitrary keys to malformed legacy conversations.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "Conversation" AS conversation
    LEFT JOIN "ConversationParticipant" AS participant
      ON participant."conversationId" = conversation.id
    GROUP BY conversation.id, conversation."pairKey"
    HAVING count(participant.id) <> 2 OR conversation."pairKey" IS NULL
  ) THEN
    RAISE EXCEPTION 'Cannot add pairKey: every private conversation must have exactly two participants';
  END IF;
END $$;

ALTER TABLE "Conversation" ALTER COLUMN "pairKey" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_pairKey_key" ON "Conversation"("pairKey");

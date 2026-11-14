-- Run once after Prisma push (`pnpm --filter @workspace/db run push`) on Supabase SQL Editor for live SSE.
CREATE OR REPLACE FUNCTION saarthi_notify_user_change()
RETURNS trigger AS $$
DECLARE
  uid uuid;
BEGIN
  IF TG_TABLE_NAME = 'saarthi_users' THEN
    uid := COALESCE(NEW.id, OLD.id);
  ELSIF TG_TABLE_NAME = 'saarthi_saved_services' THEN
    uid := COALESCE(NEW.user_id, OLD.user_id);
  ELSIF TG_TABLE_NAME = 'saarthi_chats' THEN
    uid := COALESCE(NEW.user_id, OLD.user_id);
  ELSIF TG_TABLE_NAME = 'saarthi_chat_messages' THEN
    SELECT user_id INTO uid FROM saarthi_chats WHERE id = COALESCE(NEW.chat_id, OLD.chat_id);
  ELSE
  END IF;
  IF uid IS NOT NULL THEN
    PERFORM pg_notify('saarthi_user_change', uid::text);
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_saarthi_users_notify ON saarthi_users;
CREATE TRIGGER tr_saarthi_users_notify
  AFTER INSERT OR UPDATE OR DELETE ON saarthi_users
  FOR EACH ROW EXECUTE FUNCTION saarthi_notify_user_change();

DROP TRIGGER IF EXISTS tr_saarthi_saved_notify ON saarthi_saved_services;
CREATE TRIGGER tr_saarthi_saved_notify
  AFTER INSERT OR UPDATE OR DELETE ON saarthi_saved_services
  FOR EACH ROW EXECUTE FUNCTION saarthi_notify_user_change();

DROP TRIGGER IF EXISTS tr_saarthi_chats_notify ON saarthi_chats;
CREATE TRIGGER tr_saarthi_chats_notify
  AFTER INSERT OR UPDATE OR DELETE ON saarthi_chats
  FOR EACH ROW EXECUTE FUNCTION saarthi_notify_user_change();

DROP TRIGGER IF EXISTS tr_saarthi_messages_notify ON saarthi_chat_messages;
CREATE TRIGGER tr_saarthi_messages_notify
  AFTER INSERT OR UPDATE OR DELETE ON saarthi_chat_messages
  FOR EACH ROW EXECUTE FUNCTION saarthi_notify_user_change();

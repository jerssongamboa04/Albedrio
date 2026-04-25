


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', null)
  );
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_current_timestamp_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_current_timestamp_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."toggle_task_done"("p_task_id" "uuid", "p_next_done" boolean, "p_completion_date" "date", "p_completed_at" timestamp with time zone DEFAULT "now"()) RETURNS "jsonb"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
declare
  v_task public.tasks%rowtype;
  v_last_completed_at timestamptz;
begin
  if auth.uid() is null then
    raise exception 'User not authenticated';
  end if;

  if p_completion_date is null then
    raise exception 'completion_date is required';
  end if;

  select *
  into v_task
  from public.tasks
  where id = p_task_id
    and user_id = auth.uid();

  if not found then
    raise exception 'Task not found or not accessible';
  end if;

  if v_task.task_type = 'one_time' then

    if p_next_done = true then
      update public.tasks
      set
        is_done = true,
        done_at = p_completed_at,
        updated_at = now()
      where id = v_task.id;

      insert into public.task_completions (
        task_id,
        user_id,
        completion_date,
        completed_at
      )
      values (
        v_task.id,
        auth.uid(),
        p_completion_date,
        p_completed_at
      )
      on conflict (task_id, completion_date)
      do update set
        completed_at = excluded.completed_at;

    else
      delete from public.task_completions
      where task_id = v_task.id;

      update public.tasks
      set
        is_done = false,
        done_at = null,
        updated_at = now()
      where id = v_task.id;
    end if;

  elsif v_task.task_type = 'daily' then

    if p_next_done = true then
      insert into public.task_completions (
        task_id,
        user_id,
        completion_date,
        completed_at
      )
      values (
        v_task.id,
        auth.uid(),
        p_completion_date,
        p_completed_at
      )
      on conflict (task_id, completion_date)
      do update set
        completed_at = excluded.completed_at;

      update public.tasks
      set
        is_done = true,
        done_at = p_completed_at,
        updated_at = now()
      where id = v_task.id;

    else
      delete from public.task_completions
      where task_id = v_task.id
        and completion_date = p_completion_date;

      select completed_at
      into v_last_completed_at
      from public.task_completions
      where task_id = v_task.id
      order by completion_date desc, completed_at desc
      limit 1;

      update public.tasks
      set
        is_done = false,
        done_at = v_last_completed_at,
        updated_at = now()
      where id = v_task.id;
    end if;

  else
    raise exception 'Unsupported task_type: %', v_task.task_type;
  end if;

  return jsonb_build_object(
    'task_id', v_task.id,
    'task_type', v_task.task_type,
    'next_done', p_next_done,
    'completion_date', p_completion_date
  );
end;
$$;


ALTER FUNCTION "public"."toggle_task_done"("p_task_id" "uuid", "p_next_done" boolean, "p_completion_date" "date", "p_completed_at" timestamp with time zone) OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "display_name" "text",
    "bio" "text",
    "avatar_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "profiles_bio_length_check" CHECK (("char_length"(COALESCE("bio", ''::"text")) <= 160))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."task_completions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "task_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "completion_date" "date" NOT NULL,
    "completed_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."task_completions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tasks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "notes" "text",
    "is_done" boolean DEFAULT false NOT NULL,
    "due_date" "date",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "done_at" timestamp with time zone,
    "task_type" "text" DEFAULT 'one_time'::"text" NOT NULL,
    "estimated_minutes" integer,
    "priority" "text" DEFAULT 'medium'::"text" NOT NULL,
    "energy_level" "text" DEFAULT 'medium'::"text" NOT NULL,
    "clarity_level" "text" DEFAULT 'clear'::"text" NOT NULL,
    "difficulty_level" "text" DEFAULT 'medium'::"text" NOT NULL,
    "day_moment" "text",
    CONSTRAINT "tasks_clarity_level_check" CHECK (("clarity_level" = ANY (ARRAY['clear'::"text", 'somewhat_clear'::"text", 'blocked'::"text"]))),
    CONSTRAINT "tasks_day_moment_check" CHECK ((("day_moment" = ANY (ARRAY['morning'::"text", 'afternoon'::"text", 'evening'::"text", 'any'::"text"])) OR ("day_moment" IS NULL))),
    CONSTRAINT "tasks_difficulty_level_check" CHECK (("difficulty_level" = ANY (ARRAY['light'::"text", 'medium'::"text", 'hard'::"text"]))),
    CONSTRAINT "tasks_energy_level_check" CHECK (("energy_level" = ANY (ARRAY['low'::"text", 'medium'::"text", 'high'::"text"]))),
    CONSTRAINT "tasks_estimated_minutes_check" CHECK ((("estimated_minutes" IS NULL) OR ("estimated_minutes" > 0))),
    CONSTRAINT "tasks_priority_check" CHECK (("priority" = ANY (ARRAY['low'::"text", 'medium'::"text", 'high'::"text"]))),
    CONSTRAINT "tasks_task_type_check" CHECK (("task_type" = ANY (ARRAY['one_time'::"text", 'daily'::"text"])))
);


ALTER TABLE "public"."tasks" OWNER TO "postgres";


ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."task_completions"
    ADD CONSTRAINT "task_completions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_pkey" PRIMARY KEY ("id");



CREATE INDEX "task_completions_task_date_idx" ON "public"."task_completions" USING "btree" ("task_id", "completion_date" DESC);



CREATE UNIQUE INDEX "task_completions_unique_task_day" ON "public"."task_completions" USING "btree" ("task_id", "completion_date");



CREATE INDEX "task_completions_user_date_idx" ON "public"."task_completions" USING "btree" ("user_id", "completion_date" DESC);



CREATE INDEX "tasks_user_id_idx" ON "public"."tasks" USING "btree" ("user_id");



CREATE OR REPLACE TRIGGER "set_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."set_current_timestamp_updated_at"();



CREATE OR REPLACE TRIGGER "set_tasks_updated_at" BEFORE UPDATE ON "public"."tasks" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."task_completions"
    ADD CONSTRAINT "task_completions_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."task_completions"
    ADD CONSTRAINT "task_completions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Users can delete their own profile" ON "public"."profiles" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can delete their own task completions" ON "public"."task_completions" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own profile" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can insert their own task completions" ON "public"."task_completions" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can read their own profile" ON "public"."profiles" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can read their own task completions" ON "public"."task_completions" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own profile" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));



ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."task_completions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tasks" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "tasks_delete_own" ON "public"."tasks" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "tasks_insert_own" ON "public"."tasks" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "tasks_select_own" ON "public"."tasks" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "tasks_update_own" ON "public"."tasks" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_current_timestamp_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_current_timestamp_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_current_timestamp_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."toggle_task_done"("p_task_id" "uuid", "p_next_done" boolean, "p_completion_date" "date", "p_completed_at" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."toggle_task_done"("p_task_id" "uuid", "p_next_done" boolean, "p_completion_date" "date", "p_completed_at" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."toggle_task_done"("p_task_id" "uuid", "p_next_done" boolean, "p_completion_date" "date", "p_completed_at" timestamp with time zone) TO "service_role";


















GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."task_completions" TO "anon";
GRANT ALL ON TABLE "public"."task_completions" TO "authenticated";
GRANT ALL ON TABLE "public"."task_completions" TO "service_role";



GRANT ALL ON TABLE "public"."tasks" TO "anon";
GRANT ALL ON TABLE "public"."tasks" TO "authenticated";
GRANT ALL ON TABLE "public"."tasks" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";
































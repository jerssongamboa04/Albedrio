SET session_replication_role = replica;

--
-- Safe seed data for Albedrio
-- Public example data only
--

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public
--

COPY "public"."profiles" ("id", "display_name", "bio", "avatar_url", "created_at", "updated_at") FROM stdin;
11111111-1111-1111-1111-111111111111	Usuario Demo	Perfil de ejemplo para restauración segura del proyecto.	\N	2026-04-25 00:00:00+00	2026-04-25 00:00:00+00
\.

--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public
--

COPY "public"."tasks" ("id", "user_id", "title", "notes", "is_done", "due_date", "created_at", "updated_at", "done_at", "task_type", "estimated_minutes", "priority", "energy_level", "clarity_level", "difficulty_level", "day_moment") FROM stdin;
22222222-2222-2222-2222-222222222222	11111111-1111-1111-1111-111111111111	Preparar esquema del TFG	Organizar los apartados principales de la memoria.	f	2026-04-30	2026-04-25 00:00:00+00	2026-04-25 00:00:00+00	\N	one_time	30	high	medium	clear	medium	morning
33333333-3333-3333-3333-333333333333	11111111-1111-1111-1111-111111111111	Revisar tareas del día	Comprobar la lista y decidir la siguiente acción.	t	\N	2026-04-25 00:00:00+00	2026-04-25 00:00:00+00	2026-04-25 08:30:00+00	daily	10	medium	low	clear	light	any
\.

--
-- Data for Name: task_completions; Type: TABLE DATA; Schema: public
--

COPY "public"."task_completions" ("id", "task_id", "user_id", "completion_date", "completed_at", "created_at") FROM stdin;
44444444-4444-4444-4444-444444444444	33333333-3333-3333-3333-333333333333	11111111-1111-1111-1111-111111111111	2026-04-25	2026-04-25 08:30:00+00	2026-04-25 08:30:00+00
\.

RESET ALL;
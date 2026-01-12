--
-- PostgreSQL database dump
--

\restrict SaVA6f9439HWODxV7CBZjADIQQjsAdIifuhLcOl2Fqtw6idK4mRW3LIWABdbRQI

-- Dumped from database version 16.11
-- Dumped by pg_dump version 16.11

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

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('0b458577-f4c9-43bd-977e-f618f3c68738', '014e598a1073e017fbe4fb59cb40f1e4d1e57a4af88d45fa0b584e589e4f2404', '2025-11-29 19:00:04.068929+02', '20251129170003_add_study_fields', NULL, NULL, '2025-11-29 19:00:03.897898+02', 1);
INSERT INTO public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES ('8304ab21-2d1d-4450-9b60-7ea466177462', '090c42a9b8e0feb6db8eb5e79b534a00e53c47de96861ad905d6635a3108cfbb', '2025-12-02 23:29:27.283281+02', '20251202212927_full_fix_schema', NULL, NULL, '2025-12-02 23:29:27.201706+02', 1);


--
-- Data for Name: event_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.event_types (id_type, name) VALUES (1, 'Academic');
INSERT INTO public.event_types (id_type, name) VALUES (2, 'Social');
INSERT INTO public.event_types (id_type, name) VALUES (3, 'Sportiv');
INSERT INTO public.event_types (id_type, name) VALUES (4, 'Carieră');
INSERT INTO public.event_types (id_type, name) VALUES (5, 'Workshop');
INSERT INTO public.event_types (id_type, name) VALUES (6, 'Conferință');
INSERT INTO public.event_types (id_type, name) VALUES (7, 'Cultural');
INSERT INTO public.event_types (id_type, name) VALUES (8, 'Voluntariat');
INSERT INTO public.event_types (id_type, name) VALUES (9, 'Training');
INSERT INTO public.event_types (id_type, name) VALUES (10, 'Competiție');
INSERT INTO public.event_types (id_type, name) VALUES (11, 'Expoziție');
INSERT INTO public.event_types (id_type, name) VALUES (12, 'Networking');


--
-- Data for Name: faculties; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.faculties (id_faculty, name) VALUES (1, 'Facultatea de Drept și Științe Administrative');
INSERT INTO public.faculties (id_faculty, name) VALUES (2, 'Facultatea de Economie, Administrație și Afaceri');
INSERT INTO public.faculties (id_faculty, name) VALUES (3, 'Facultatea de Educație Fizică și Sport');
INSERT INTO public.faculties (id_faculty, name) VALUES (4, 'Facultatea de Inginerie Alimentară');
INSERT INTO public.faculties (id_faculty, name) VALUES (5, 'Facultatea de Inginerie Electrică și Știința Calculatoarelor');
INSERT INTO public.faculties (id_faculty, name) VALUES (6, 'Facultatea de Inginerie Mecanică, Autovehicule și Robotică');
INSERT INTO public.faculties (id_faculty, name) VALUES (7, 'Facultatea de Istorie, Geografie și Științe Sociale');
INSERT INTO public.faculties (id_faculty, name) VALUES (8, 'Facultatea de Litere și Științe ale Comunicării');
INSERT INTO public.faculties (id_faculty, name) VALUES (9, 'Facultatea de Medicină și Științe Biologice');
INSERT INTO public.faculties (id_faculty, name) VALUES (10, 'Facultatea de Psihologie și Științe ale Educației');
INSERT INTO public.faculties (id_faculty, name) VALUES (11, 'Facultatea de Silvicultură');


--
-- Data for Name: specializations; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (1, 'Drept', 'licenta', 1);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (2, 'Drept European și Internațional', 'licenta', 1);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (3, 'Administrație Publică', 'licenta', 1);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (4, 'Poliție Locală', 'licenta', 1);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (5, 'Management și Administrație Europeană', 'master', 1);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (6, 'Economia comerțului, turismului și serviciilor', 'licenta', 2);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (7, 'Administrarea afacerilor', 'licenta', 2);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (8, 'Finanțe și bănci', 'licenta', 2);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (9, 'Contabilitate și informatică de gestiune', 'licenta', 2);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (10, 'Management', 'licenta', 2);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (11, 'Afaceri internaționale', 'licenta', 2);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (12, 'Informatică economică', 'licenta', 2);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (13, 'Economie generală și comunicare economică', 'licenta', 2);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (14, 'Asistență managerială și administrativă', 'licenta', 2);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (15, 'Matematică informatică', 'licenta', 2);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (16, 'Administrarea și Formarea Resurselor Umane în Organizații', 'master', 2);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (17, 'Management și Administrarea Afacerilor', 'master', 2);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (18, 'Managementul Firmelor de Comert, Turism și Servicii', 'master', 2);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (19, 'Planning of New Tourism Products and Destination Management', 'master', 2);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (20, 'Audit și Guvernanță Corporativă', 'master', 2);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (21, 'Contabilitate, Audit Financiar și Expertiză Contabilă', 'master', 2);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (22, 'Management și Audit în Administrație și Afaceri', 'master', 2);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (23, 'Globalizare și Diplomație Economică', 'master', 2);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (24, 'Digitalizare și Data Science', 'master', 2);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (25, 'Educație Fizică și Sport', 'licenta', 3);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (26, 'Kinetoterapie și motricitate specială', 'licenta', 3);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (27, 'Kinetoprofilaxie, recuperare și modelare corporală', 'master', 3);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (28, 'Educație Fizică Școlară și Activități Extracurriculare', 'master', 3);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (29, 'Inginerie și management în alimentația publică și agroturism', 'licenta', 4);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (30, 'Ingineria produselor alimentare', 'licenta', 4);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (31, 'Controlul și expertiza produselor alimentare', 'licenta', 4);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (32, 'Protecția consumatorului și a mediului', 'licenta', 4);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (33, 'Științe gastronomice', 'licenta', 4);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (34, 'Managementul suplimentelor alimentare și al produselor pentru sănătate', 'master', 4);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (35, 'Controlul și expertiza produselor alimentare', 'master', 4);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (36, 'Managementul igienei, controlul calității produselor alimentare și asigurarea sănătății populației', 'master', 4);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (37, 'Managementul securității mediului și siguranță alimentară', 'master', 4);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (38, 'Calculatoare', 'licenta', 5);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (39, 'Calculatoare – DUAL', 'licenta', 5);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (40, 'Electronică aplicată', 'licenta', 5);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (41, 'Rețele și software de telecomunicații', 'licenta', 5);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (42, 'Sisteme electrice', 'licenta', 5);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (43, 'Sisteme electrice – DUAL', 'licenta', 5);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (44, 'Energetică și tehnologii informatice', 'licenta', 5);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (45, 'Managementul energiei', 'licenta', 5);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (46, 'Automatică și informatică aplicată', 'licenta', 5);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (47, 'Automatică și informatică aplicată – DUAL', 'licenta', 5);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (48, 'Echipamente și sisteme de comandă și control pentru autovehicule', 'licenta', 5);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (49, 'Echipamente și sisteme medicale', 'licenta', 5);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (50, 'Știința și ingineria calculatoarelor', 'master', 5);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (51, 'Tehnici avansate în mașini și acționări electrice', 'master', 5);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (52, 'Rețele de calculatoare și comunicații', 'master', 5);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (53, 'Securitate cibernetică', 'master', 5);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (54, 'Sisteme moderne pentru conducerea proceselor energetice', 'master', 5);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (55, 'Tehnologia informației și comunicării', 'conversie', 5);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (56, 'Tehnologia Construcțiilor de Mașini – DUAL', 'licenta', 6);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (57, 'Tehnologia Construcțiilor de Mașini', 'licenta', 6);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (58, 'Mecatronică', 'licenta', 6);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (59, 'Robotică', 'licenta', 6);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (60, 'Inginerie Mecanică – DUAL', 'licenta', 6);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (61, 'Inginerie Mecanică', 'licenta', 6);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (62, 'Autovehicule Rutiere', 'licenta', 6);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (63, 'Ingineria și Managementul Calității, Sănătății și Securității în Muncă', 'master', 6);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (64, 'Mecatronica Autovehiculelor', 'master', 6);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (65, 'Educație tehnologică', 'conversie', 6);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (66, 'Asistență socială', 'licenta', 7);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (67, 'Geografie', 'licenta', 7);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (68, 'Geografia turismului', 'licenta', 7);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (69, 'Istorie', 'licenta', 7);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (70, 'Relații internaționale și studii europene', 'licenta', 7);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (71, 'Resurse umane', 'licenta', 7);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (72, 'Filosofie', 'conversie', 7);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (73, 'Istorie', 'conversie', 7);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (74, 'Istorie: permanențe, interferențe și schimbare', 'master', 7);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (75, 'G.I.S. și planificare teritorială', 'master', 7);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (76, 'Managementul relațiilor internaționale și al cooperării transfrontaliere', 'master', 7);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (77, 'Turism și dezvoltare regională', 'master', 7);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (78, 'Etică aplicată și auditul eticii în organizații', 'master', 7);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (79, 'Managementul serviciilor sociale și de securitate comunitară', 'master', 7);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (80, 'Asistență socială', 'licenta', 7);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (81, 'Geografie', 'licenta', 7);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (82, 'Geografia turismului', 'licenta', 7);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (83, 'Istorie', 'licenta', 7);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (84, 'Relații internaționale și studii europene', 'licenta', 7);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (85, 'Resurse umane', 'licenta', 7);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (86, 'Filosofie', 'conversie', 7);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (87, 'Istorie', 'conversie', 7);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (88, 'Istorie: permanențe, interferențe și schimbare', 'master', 7);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (89, 'G.I.S. și planificare teritorială', 'master', 7);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (90, 'Managementul relațiilor internaționale și al cooperării transfrontaliere', 'master', 7);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (91, 'Turism și dezvoltare regională', 'master', 7);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (92, 'Etică aplicată și auditul eticii în organizații', 'master', 7);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (93, 'Managementul serviciilor sociale și de securitate comunitară', 'master', 7);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (113, 'Limba și literatura română – Limbă și literatură modernă (franceză/germană/spaniolă/italiană)', 'licenta', 8);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (114, 'Limba și literatura engleză – Limbă și literatură română / germană / spaniolă / italiană', 'licenta', 8);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (115, 'Limba și literatura franceză – Limbă și literatură engleză / germană / spaniolă / italiană', 'licenta', 8);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (116, 'Limba și literatura ucraineană – Limbă și literatură modernă (franceză/engleză)/Limba și literatura română', 'licenta', 8);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (117, 'Media digitală', 'licenta', 8);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (118, 'Comunicare și relații publice', 'licenta', 8);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (119, 'Cinematografie, fotografie, media', 'licenta', 8);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (120, 'Teoria și practica traducerii', 'master', 8);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (121, 'Literatura română în context european', 'master', 8);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (122, 'Limbă și comunicare', 'master', 8);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (123, 'Engleză în era digitală (English in the digital Age)', 'master', 8);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (124, 'Comunicare, media și industriile creative', 'master', 8);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (125, 'Limba și literatura română', 'conversie', 8);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (126, 'Limba și literatura franceză', 'conversie', 8);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (127, 'Limba și literatura engleză', 'conversie', 8);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (128, 'Limba și literatura germană', 'conversie', 8);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (129, 'Limba și literatura spaniolă', 'conversie', 8);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (130, 'Limba și literatura italiană', 'conversie', 8);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (131, 'Limba și literatura ucraineană', 'conversie', 8);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (132, 'Medicină', 'licenta', 9);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (133, 'Asistență Medicală Generală', 'licenta', 9);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (134, 'Balneofiziokinetoterapie și Recuperare', 'licenta', 9);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (135, 'Biochimie', 'licenta', 9);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (136, 'Biologie', 'licenta', 9);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (137, 'Nutriție și Dietetică', 'licenta', 9);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (138, 'Tehnică Dentară', 'licenta', 9);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (139, 'Nutriție și Recuperare Medicală', 'master', 9);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (140, 'Pedagogia învățământului primar și preșcolar', 'licenta', 10);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (141, 'Psihologie', 'licenta', 10);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (142, 'Consiliere școlară și educație emoțională', 'master', 10);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (143, 'Managementul instituțiilor educaționale', 'master', 10);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (144, 'Master in Resilience in Educational Contexts', 'master', 10);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (145, 'Pedagogia învățământului primar și preșcolar', 'conversie', 10);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (146, 'Silvicultură', 'licenta', 11);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (147, 'Ecologie și Protecția Mediului', 'licenta', 11);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (148, 'Silvicultură', 'master', 11);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (149, 'Silvicultură', 'doctorat', 11);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (150, 'Filologie', 'doctorat', 8);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (151, 'Istorie', 'doctorat', 7);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (152, 'Geografie', 'doctorat', 7);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (153, 'Filosofie', 'doctorat', 7);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (154, 'Inginerie industrială', 'doctorat', 6);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (155, 'Inginerie mecanică', 'doctorat', 6);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (156, 'Inginerie electronică, telecomunicații și tehnologii informaționale', 'doctorat', 5);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (157, 'Calculatoare și tehnologia informației', 'doctorat', 5);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (158, 'Inginerie electrică', 'doctorat', 5);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (159, 'Ingineria produselor alimentare', 'doctorat', 4);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (160, 'Economie', 'doctorat', 2);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (161, 'Administrarea afacerilor', 'doctorat', 2);
INSERT INTO public.specializations (id_specialization, name, study_cycle, faculty_id) VALUES (162, 'Contabilitate', 'doctorat', 2);


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.users (id_user, email, password_hash, role, faculty_id, study_cycle, specialization_id, study_year, created_at, "isApproved", organization_description, organization_name, organization_type, phone, last_name, first_name, "isRejected") VALUES (2, 'ion@student.com', '$2b$10$ErHVbgbaBIkCBT4yIzg3wu1u4jO0rI0jHhUtC1ur.4BqqKmXurF0S', 'STUDENT', 1, 'Licenta', 2, 2, '2025-12-02 21:32:05.834', true, NULL, NULL, NULL, NULL, NULL, NULL, false);
INSERT INTO public.users (id_user, email, password_hash, role, faculty_id, study_cycle, specialization_id, study_year, created_at, "isApproved", organization_description, organization_name, organization_type, phone, last_name, first_name, "isRejected") VALUES (4, 'org1@test.com', '$2b$10$yqBONWrAgxd4jtyaFQ6ZMuY5GcQGG3JnJkMU0EUS3t7L4E5M/7mwu', 'ORGANIZER', NULL, NULL, NULL, NULL, '2025-12-02 21:58:47.85', false, 'Organizăm evenimente.', 'Asociația X', 'Asociatie', '0747000000', NULL, NULL, false);
INSERT INTO public.users (id_user, email, password_hash, role, faculty_id, study_cycle, specialization_id, study_year, created_at, "isApproved", organization_description, organization_name, organization_type, phone, last_name, first_name, "isRejected") VALUES (3, 'org@test.com', '$2b$10$dVxl/H6TChC8pLSLZjP47.At7NoSQYz5/Y4lqZgdBZ6vnWto3IWom', 'ORGANIZER', NULL, NULL, NULL, NULL, '2025-12-02 21:45:49.888', true, 'Organizam evenimente pentru studenti', 'Asociatia Studentilor', 'Asociatie', '0740000000', NULL, NULL, false);
INSERT INTO public.users (id_user, email, password_hash, role, faculty_id, study_cycle, specialization_id, study_year, created_at, "isApproved", organization_description, organization_name, organization_type, phone, last_name, first_name, "isRejected") VALUES (5, 'org2@test.com', '$2b$10$mInEsmhWfJ1iqP9nGZKYcO79c9n8SU8VSQ4uI4lWJpwscCweIjywK', 'ORGANIZER', NULL, NULL, NULL, NULL, '2025-12-02 22:32:59.433', true, 'Organizam evenimente.', 'Asociatia X', 'Asociatie', '0740000000', NULL, NULL, false);
INSERT INTO public.users (id_user, email, password_hash, role, faculty_id, study_cycle, specialization_id, study_year, created_at, "isApproved", organization_description, organization_name, organization_type, phone, last_name, first_name, "isRejected") VALUES (1, 'admin@usv.ro', '$2b$10$by1gnhsDVzYahsSoprd9V.s087suIVYYNx//EEtJTRaZNmy4zFRTO', 'ADMIN', NULL, NULL, NULL, NULL, '2025-11-30 18:36:50.219269', true, NULL, NULL, NULL, NULL, NULL, NULL, false);
INSERT INTO public.users (id_user, email, password_hash, role, faculty_id, study_cycle, specialization_id, study_year, created_at, "isApproved", organization_description, organization_name, organization_type, phone, last_name, first_name, "isRejected") VALUES (6, 'ion.popescu@student.univ.ro', '$2b$10$gecvXhf6XIk1kj.nVTAuJ.DRS8GmavEdhUIpZ0OoKZdMK1T3ZJ32y', 'student', 1, 'Licenta', 2, 2, '2025-12-06 21:51:02.996', false, NULL, NULL, NULL, NULL, 'Ion', 'Popescu', false);
INSERT INTO public.users (id_user, email, password_hash, role, faculty_id, study_cycle, specialization_id, study_year, created_at, "isApproved", organization_description, organization_name, organization_type, phone, last_name, first_name, "isRejected") VALUES (7, 'ana.marin@student.usv.ro', '$2b$10$G5P5B3hUGvpM1hCwId8Kg.p10WTTlv4IKm27sqxV923MtZAHn3L/m', 'student', 1, 'Licenta', 2, 1, '2025-12-06 21:58:55.083', true, NULL, NULL, NULL, NULL, 'Marin', 'Ana', false);
INSERT INTO public.users (id_user, email, password_hash, role, faculty_id, study_cycle, specialization_id, study_year, created_at, "isApproved", organization_description, organization_name, organization_type, phone, last_name, first_name, "isRejected") VALUES (10, 'andrei.bumbac@student.usv.ro', '$2b$10$qD2hYfyjYHKhhYQ2E2a9BuwkkkPTtYHQj36P3GZJmu/C3azEsdAqa', 'STUDENT', 1, 'Licenta', 2, 2, '2025-12-07 12:29:13.326', true, NULL, NULL, NULL, NULL, 'Bumbac', 'Andrei', false);
INSERT INTO public.users (id_user, email, password_hash, role, faculty_id, study_cycle, specialization_id, study_year, created_at, "isApproved", organization_description, organization_name, organization_type, phone, last_name, first_name, "isRejected") VALUES (11, 'mihai.ghita@gmail.com', '$2b$10$DtdrFo3d92fnG87HnsH2O.iIw0.r0fX/qXVIuL5sUQfl8f8BHLdqK', 'ORGANIZER', NULL, NULL, NULL, NULL, '2025-12-07 12:31:23.648', true, 'Vreau să organizez evenimente educaționale.', 'Asociația Tinerilor', 'ONG', '0740123456', 'Ghita', 'Mihai', false);
INSERT INTO public.users (id_user, email, password_hash, role, faculty_id, study_cycle, specialization_id, study_year, created_at, "isApproved", organization_description, organization_name, organization_type, phone, last_name, first_name, "isRejected") VALUES (12, 'daniel.burtila@gmail.com', '$2b$10$xDo8PkKKBnQnx4eKJ7SAXumGH9Tm9RXNpL1UGzbUn/HdkRyh4FowS', 'ORGANIZER', NULL, NULL, NULL, NULL, '2025-12-07 20:05:58.497', true, 'Vreau să organizez evenimente educaționale.', 'Asociația Tinerilor', 'ONG', '0740123456', 'Burtila', 'Daniel', false);


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: admin_actions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: favorite_events; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: feedback; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: files; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: recommendation_history; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: registrations; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Name: admin_actions_id_action_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.admin_actions_id_action_seq', 1, false);


--
-- Name: event_types_id_type_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.event_types_id_type_seq', 12, true);


--
-- Name: events_id_event_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.events_id_event_seq', 1, false);


--
-- Name: faculties_id_faculty_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.faculties_id_faculty_seq', 22, true);


--
-- Name: favorite_events_id_favorite_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.favorite_events_id_favorite_seq', 1, false);


--
-- Name: feedback_id_feedback_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.feedback_id_feedback_seq', 1, false);


--
-- Name: files_id_file_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.files_id_file_seq', 1, false);


--
-- Name: recommendation_history_id_record_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.recommendation_history_id_record_seq', 1, false);


--
-- Name: registrations_id_registration_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.registrations_id_registration_seq', 1, false);


--
-- Name: specializations_id_specialization_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.specializations_id_specialization_seq', 162, true);


--
-- Name: users_id_user_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_user_seq', 12, true);


--
-- PostgreSQL database dump complete
--

\unrestrict SaVA6f9439HWODxV7CBZjADIQQjsAdIifuhLcOl2Fqtw6idK4mRW3LIWABdbRQI


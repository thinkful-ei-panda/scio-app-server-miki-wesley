BEGIN;

TRUNCATE
  "word",
  "language",
  "user";

INSERT INTO "user" ("id", "username", "name", "password")
VALUES
  (
    1,
    'admin',
    'Dunder Mifflin Admin',
    -- password = "pass"
    '$2a$10$fCWkaGbt7ZErxaxclioLteLUgg4Q3Rp09WW0s/wSLxDKYsaGYUpjG'
  );

INSERT INTO "language" ("id", "name", "user_id")
VALUES
  (1, 'Latin', 1);

INSERT INTO "word" ("id", "language_id", "original", "translation", "next")
VALUES  
  (1, 1, 'AD - anno Domini', 'in the year of the Lord', 2),
  (2, 1, 'Cp - ceteris Paribus', 'all other things equal', 3),
  (3, 1, 'et al.', 'and others', 4),
  (4, 1, 'etc. - et cetera', 'and other things', 5),
  (5, 1, 'e.g. - exempli gratia', 'for example', 6),
  (6, 1, 'i.e. - id est', 'in other words', 7),
  (7, 1, 'P.S. - post scriptum', 'after what has been written', 8),
  (8, 1, 'R.I.P. - requiescat in pace', 'rest in peace', 9),
  (9, 1, 's.o.s. - si opus-sit', 'if there is need', 10),
  (10, 1, 'C.V. - curriculum vitae', 'resume', 11),
  (11, 1, 'f/ff - folio/foliis', 'following', 12),
  (12, 1, 'vs. - versus', 'against', null);

UPDATE "language" SET head = 1 WHERE id = 1;

-- because we explicitly set the id fields
-- update the sequencer for future automatic id setting
SELECT setval('word_id_seq', (SELECT MAX(id) from "word"));
SELECT setval('language_id_seq', (SELECT MAX(id) from "language"));
SELECT setval('user_id_seq', (SELECT MAX(id) from "user"));

COMMIT;

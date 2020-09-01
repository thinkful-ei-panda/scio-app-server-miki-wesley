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
  ),
  (
    2,
    'adminFrench',
    'Dunder Mifflin Admin',
    -- password = "pass"
    '$2a$10$fCWkaGbt7ZErxaxclioLteLUgg4Q3Rp09WW0s/wSLxDKYsaGYUpjG'
  );

INSERT INTO "language" ("id", "name", "user_id")
VALUES
  (1, 'French', 2),
  (2, 'Latin', 1);

INSERT INTO "word" ("id", "language_id", "original", "translation", "next")
VALUES
  (1, 1, 'entraine toi', 'practice', 2),
  (2, 1, 'bonjour', 'hello', 3),
  (3, 1, 'maison', 'house', 4),
  (4, 1, 'développeur', 'developer', 5),
  (5, 1, 'traduire', 'translate', 6),
  (6, 1, 'incroyable', 'amazing', 7),
  (7, 1, 'chien', 'dog', 8),
  (8, 1, 'chat', 'cat', null),
  (9, 2, 'AD - anno Domini', 'in the year of the Lord', 10),
  (10, 2, 'Cp - ceteris Paribus', 'all other things being equal', 11),
  (11, 2, 'et al.', 'et al, and others', 12),
  (12, 2, 'etc. - et cetera', 'and other things', 13),
  (13, 2, 'e.g. - exempli gratia', 'for example', 14),
  (14, 2, 'i.e. - id est', 'in other words', 15),
  (15, 2, 'P.S. - post scriptum', 'after what has been written', 16),
  (16, 2, 'R.I.P. - requiescat in pace', 'may he/she rest in peace', 17),
  (17, 2, 's.o.s. - si opus-sit', 'if there is need', 18),
  (18, 2, 'vs. - versus', 'against', 19),
  (19, 2, 'f/ff - folio/foliis', 'following', 20),
  (20, 2, 'vs. - versus', 'against', null);

UPDATE "language" SET head = 1 WHERE id = 1;
UPDATE "language" SET head = 1 WHERE id = 2;

-- because we explicitly set the id fields
-- update the sequencer for future automatic id setting
SELECT setval('word_id_seq', (SELECT MAX(id) from "word"));
SELECT setval('language_id_seq', (SELECT MAX(id) from "language"));
SELECT setval('user_id_seq', (SELECT MAX(id) from "user"));

COMMIT;

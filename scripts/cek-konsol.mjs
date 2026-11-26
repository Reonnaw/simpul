// Self-check penjaga konsol. Jalankan: node scripts/cek-konsol.mjs
import assert from "node:assert/strict";
import { cekPipeline, cekSql, pecahSql } from "../lib/konsol.ts";

assert.deepEqual(pecahSql("SELECT 1; SELECT 2;"), ["SELECT 1", "SELECT 2"]);
assert.deepEqual(pecahSql("SELECT 'a;b', \"c;d\", `e;f`"), ["SELECT 'a;b', \"c;d\", `e;f`"]);
assert.deepEqual(pecahSql("SELECT 'it\\'s;'"), ["SELECT 'it\\'s;'"]);
assert.deepEqual(pecahSql("-- komentar; DROP\nSELECT 1 # x; y\n"), ["SELECT 1"]);
assert.deepEqual(pecahSql("SELECT 1 /*!50000 ; DROP TABLE x */"), ["SELECT 1"]);
assert.deepEqual(pecahSql("SELECT 5--3"), ["SELECT 5--3"]); // "--" tanpa spasi bukan komentar

const boleh = (s) => assert.equal(cekSql(s), null, s);
const tolak = (s) => assert.ok(cekSql(s), s);
boleh("SELECT * FROM KENDARAAN");
boleh("with x as (select 1) select * from x");
boleh("(SELECT 1) UNION (SELECT 2)");
boleh("UPDATE KENDARAAN SET plat_nomor = 'X' WHERE id_kendaraan = 'KND001'");
boleh("SELECT * FROM INFORMATION_SCHEMA.TABLES");
boleh("EXPLAIN SELECT 1");
tolak("DROP TABLE KENDARAAN");
tolak("SET autocommit = 1");
tolak("COMMIT");
tolak("CREATE TABLE x (a INT)");
tolak("SELECT * FROM mysql.user");
tolak("SELECT * FROM `mysql`.user");
tolak("SELECT SLEEP(100)");
tolak("SELECT * FROM KENDARAAN INTO OUTFILE '/tmp/x'");
tolak("");

assert.equal(cekPipeline([{ $match: { kota: "Surabaya" } }]), null);
assert.ok(cekPipeline([{ $out: "x" }]));
assert.ok(cekPipeline([{ $facet: { a: [{ $merge: { into: "x" } }] } }]));
assert.ok(cekPipeline([{ $match: { $where: "1" } }]));
assert.ok(cekPipeline({ $match: {} }));
assert.ok(cekPipeline([]));
assert.ok(cekPipeline([[]]));

console.log("cek-konsol: semua lolos");

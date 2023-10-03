import { pgGenerate } from "drizzle-dbml-generator"; // Using Postgres for this example

import { schema } from "..";

const out = "./schema.dbml";
const relational = true;

pgGenerate({ schema: schema, out, relational });

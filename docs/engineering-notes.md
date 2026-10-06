# Engineering notes

## `GET /chapters/latest` must be mounted before `getChapterHandler`

`apps/api/src/routers/chapters-router.ts` registers
`listLatestChaptersHandler` as its first `.route("/", …)` call, above
`getChapterHandler`. The ordering is load-bearing: `getChapterHandler`
registers `GET /:id`, so if it were registered first a request to
`GET /chapters/latest` would match `/:id` with `id = "latest"` and
`checkChapter()` would reject it with a 422 "not a valid UUID" before the
latest-chapters handler ever ran.

Nothing in the type system or the linter protects this. A future cleanup that
sorts the imports and the `.route(...)` calls alphabetically would silently
break the route. The only thing that catches a regression is the integration
test `apps/api/src/__integration-tests__/chapters/list-latest-chapters.test.ts`.

## The two chapter feeds share one row shape

`GET /chapters/latest` and `GET /users/me/feed` return the same row shape, so
the web client can render one component for both. The shape is defined once as
`chapterFeedItemSchema` in `apps/api/src/utils/schemas.ts`, and both handlers
select exactly those columns — a divergence between the two responses is a
design decision, not something to introduce by accident.

Both feeds read the media's main title with a correlated scalar subquery
(`titles` where `isMainTitle`) rather than a join. A join would be wrong twice
over: an inner join silently drops a chapter whose media has no live main
title, and because nothing in the schema enforces at most one main title per
media, a join could emit a chapter twice and corrupt pagination. The subquery
yields exactly one nullable value per chapter.

Both feeds also order by `(createdAt desc, id desc)`. The `id` tiebreak is
what makes offset pagination safe when two chapters share a `createdAt` to the
millisecond — which is the normal case for a batch upload, and for the seeded
data.

## `apps/api`'s response types are load-bearing for `apps/web`

`apps/web` talks to `apps/api` through Hono RPC (`hc<AppType>()` in
`apps/web/src/lib/api.ts`). `hc` derives the client's request and response
types from the app's inferred `Schema`, which is assembled from two things
only: the `TypedResponse` each handler returns, and the `Input` generic each
middleware in a route's chain declares. Neither is something the API gets for
free — both are spelled out deliberately, and both degrade silently when
removed.

### `ok` and `fail` must keep returning `Response & TypedResponse<…>`

`apps/api/src/middlewares/context-middleware.ts` declares `AppContext.ok` and
`AppContext.fail` as returning `Response & TypedResponse<JSONParsed<T>, S,
"json">` — the same intersection Hono's own `c.json()` returns. The two halves
each do a job:

- The `TypedResponse` half is what `hc` reads. Every one of the API's handlers
  returns `c.ok(…)` / `c.fail(…)` rather than `c.json(…)` directly, so if these
  two signatures say `Response`, **every route in the app infers as `Response`
  and the entire generated client collapses to `any`**.
- The `Response` half is what keeps the rest of the app compiling. Roughly
  twenty `check-*` / `require-*` / `validate-*` middlewares, plus `app.notFound`
  and the `onError` handler, sit in positions Hono types as returning
  `Response`. Declaring the return as a bare `TypedResponse` breaks all of them
  at once.

`JSONParsed<T>` is applied for the same reason Hono applies it: the client
receives whatever survived `JSON.stringify`, so a `Date` column must surface as
`string` on the client, not as `Date`. Without it the client would be typed
confidently and wrongly.

`ok` is declared as an overload pair rather than one signature with an optional
`meta`, so that paginated routes get `meta` as a required, precisely-typed
property and unpaginated routes get no `meta` key at all. An overloaded
signature cannot be satisfied by an arrow-function expression, which is why the
two assignments in the middleware body carry
`as AppContext["ok"]` / `as AppContext["fail"]` casts. The casts are over the
_signature_, not over any value — the implementations still call `c.json(…)`
and are unchanged at runtime.

`200 | 201` is the status for `ok` because the implementation picks it from the
request method at runtime (`c.req.method === "POST" ? 201 : 200`). `fail`'s
status is computed per error code from `apps/api/src/utils/errors.ts`, which is
declared `as const`; that is what makes `(typeof errors)[C]["code"]` resolve to
a literal status rather than `number`.

**Nothing in `apps/api`'s own test suite fails if any of this is simplified
away.** The integration tests assert on runtime JSON, which does not change.
The only symptom is that `apps/web` quietly stops being type-checked against
the API. This is the single highest-value thing to guard when reviewing changes
to `context-middleware.ts`.

### The validators' third generic, and why query and param are typed loosely

`validate-json-middleware.ts`, `validate-query-middleware.ts` and
`validate-param-middleware.ts` pass `createMiddleware`'s third generic
(`I extends Input`) in addition to the `Env` generic. That generic is the only
hook `hc` reads request types from — it is the same mechanism
`@hono/zod-validator` uses. Without it the client accepts any request shape.

The three are not typed the same way, on purpose:

- **JSON** declares `{ in: { json: z.input<TSchema> }; out: { json:
z.output<TSchema> } }`. Hono types `ValidationTargets.json` as `any`, so a
  Zod input type can be declared there without fighting a constraint. JSON
  bodies are therefore fully typed on the client.
- **Query** declares `in` as `Record<string, string | string[]>` and **param**
  as `Record<string, string>` — Hono's own target types, not `z.input`.
  `ValidationTargets.query` is `Record<string, string | string[]>`, and these
  schemas coerce (`page` and `perPage` arrive as strings and parse to numbers),
  so a coercing schema's `z.input` does not satisfy the constraint and the
  build fails.

The consequence is a deliberate asymmetry: **responses and JSON bodies are
fully typed on the client; query-string keys and path params are not.** That is
most of the value for a fraction of the fight. If the loose typing becomes
painful, the fix is to split each query schema into a string-shaped input schema
plus an explicit coercion step — not to weaken the constraint.

`validate-form-data-middleware.ts` is deliberately left without the generic.
Multipart bodies here include nested arrays containing `File`s, which do not fit
`ValidationTargets.form`. Those endpoints keep working at runtime and stay
untyped on the client.

### `z.coerce.*` fields are unchecked on the client, even inside JSON bodies

Zod 4 types `z.coerce.number()`'s **input** as `unknown` — coercion exists
precisely to accept whatever arrives. `paginationQuerySchema` in
`@taiyomoe/schemas` builds `page` and `perPage` that way, and
`searchMediasInputSchema` spreads it in, so on the RPC client
`api.medias.search.$post({ json: { page: "nonsense" } })` **type-checks** even
though the rest of the body does not: `q: 123`, an unknown `filter` operator and
a bad `sort.field` are all rejected at compile time.

This is the same coercion problem that forces query strings to be typed loosely,
surfacing inside a JSON body. It is narrow — it affects exactly the
`z.coerce`-built fields, which today means pagination — and no client generator
that honours Zod's declared input types would do better. The fix, if it matters,
is the same one: a string-shaped input schema plus an explicit coercion step,
rather than `z.coerce` in the schema the client is derived from.

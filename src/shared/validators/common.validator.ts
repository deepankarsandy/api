import { t } from "elysia";

export const PaginationQuery = t.Object({
  page: t.Optional(t.Numeric({ minimum: 1, default: 1 })),
  offset: t.Optional(t.Numeric({ minimum: 0, default: 0 })),
  limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100, default: 20 })),
});

// Custom transform — coerce and validate
export const CommaSeparatedArray = t
  .Transform(t.String({ description: "Comma-separated values e.g. a,b,c" }))
  .Decode((val) =>
    val
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  )
  .Encode((val) => val.join(","));

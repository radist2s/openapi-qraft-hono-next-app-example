import { z } from "@hono/zod-openapi";

const ZodIssueBaseSchema = z.object({
  path: z.array(z.union([z.string(), z.number()])),
  message: z.string(),
  fatal: z.boolean().optional(),
});

const ZodParsedTypeSchema = z.enum([
  "string",
  "nan",
  "number",
  "integer",
  "float",
  "boolean",
  "date",
  "bigint",
  "symbol",
  "undefined",
  "null",
  "array",
  "object",
  "function",
  "unknown",
  "promise",
  "void",
  "never",
  "map",
  "set",
]);

const ZodInvalidTypeIssueSchema = ZodIssueBaseSchema.extend({
  code: z.literal("invalid_type"),
  expected: ZodParsedTypeSchema,
  received: ZodParsedTypeSchema,
});

const ZodInvalidLiteralIssueSchema = ZodIssueBaseSchema.extend({
  code: z.literal("invalid_literal"),
  expected: z.any(),
  received: z.any(),
});

const ZodUnrecognizedKeysIssueSchema = ZodIssueBaseSchema.extend({
  code: z.literal("unrecognized_keys"),
  keys: z.array(z.string()),
});

const ZodInvalidUnionIssueSchema = ZodIssueBaseSchema.extend({
  code: z.literal("invalid_union"),
  // unionErrors: z.array(z.lazy(() => ZodErrorSchema)),
  unionErrors: z.array(z.any()),
});

const ZodInvalidUnionDiscriminatorIssueSchema = ZodIssueBaseSchema.extend({
  code: z.literal("invalid_union_discriminator"),
  options: z.array(z.union([z.string(), z.number(), z.boolean(), z.null()])),
});

const ZodInvalidEnumValueIssueSchema = ZodIssueBaseSchema.extend({
  code: z.literal("invalid_enum_value"),
  received: z.union([z.string(), z.number()]),
  options: z.array(z.union([z.string(), z.number()])),
});

const ZodInvalidArgumentsIssueSchema = ZodIssueBaseSchema.extend({
  code: z.literal("invalid_arguments"),
  // argumentsError: z.lazy(() => ZodErrorSchema),
  argumentsError: z.any(),
});

const ZodInvalidReturnTypeIssueSchema = ZodIssueBaseSchema.extend({
  code: z.literal("invalid_return_type"),
  // returnTypeError: z.lazy(() => ZodErrorSchema),
  returnTypeError: z.any(),
});

const ZodInvalidDateIssueSchema = ZodIssueBaseSchema.extend({
  code: z.literal("invalid_date"),
});

const ZodInvalidStringIssueSchema = ZodIssueBaseSchema.extend({
  code: z.literal("invalid_string"),
  validation: z.union([
    z.literal("email"),
    z.literal("url"),
    z.literal("emoji"),
    z.literal("uuid"),
    z.literal("nanoid"),
    z.literal("regex"),
    z.literal("cuid"),
    z.literal("cuid2"),
    z.literal("ulid"),
    z.literal("datetime"),
    z.literal("date"),
    z.literal("time"),
    z.literal("duration"),
    z.literal("ip"),
    z.literal("base64"),
    z.object({
      includes: z.string(),
      position: z.number().optional(),
    }),
    z.object({
      startsWith: z.string(),
    }),
    z.object({
      endsWith: z.string(),
    }),
  ]),
});

const ZodTooSmallIssueSchema = ZodIssueBaseSchema.extend({
  code: z.literal("too_small"),
  minimum: z.union([z.number(), z.bigint()]),
  inclusive: z.boolean(),
  exact: z.boolean().optional(),
  type: z.enum(["array", "string", "number", "set", "date", "bigint"]),
});

const ZodTooBigIssueSchema = ZodIssueBaseSchema.extend({
  code: z.literal("too_big"),
  maximum: z.union([z.number(), z.bigint()]),
  inclusive: z.boolean(),
  exact: z.boolean().optional(),
  type: z.enum(["array", "string", "number", "set", "date", "bigint"]),
});

const ZodInvalidIntersectionTypesIssueSchema = ZodIssueBaseSchema.extend({
  code: z.literal("invalid_intersection_types"),
});

const ZodNotMultipleOfIssueSchema = ZodIssueBaseSchema.extend({
  code: z.literal("not_multiple_of"),
  multipleOf: z.union([z.number(), z.bigint()]),
});

const ZodNotFiniteIssueSchema = ZodIssueBaseSchema.extend({
  code: z.literal("not_finite"),
});

const ZodCustomIssueSchema = ZodIssueBaseSchema.extend({
  code: z.literal("custom"),
  params: z.record(z.any()).optional(),
});

// Объединение всех схем в одну
export const ZodIssueUnionSchema = z
  .union([
    ZodInvalidTypeIssueSchema,
    ZodInvalidLiteralIssueSchema,
    ZodUnrecognizedKeysIssueSchema,
    ZodInvalidUnionIssueSchema,
    ZodInvalidUnionDiscriminatorIssueSchema,
    ZodInvalidEnumValueIssueSchema,
    ZodInvalidArgumentsIssueSchema,
    ZodInvalidReturnTypeIssueSchema,
    ZodInvalidDateIssueSchema,
    ZodInvalidStringIssueSchema,
    ZodTooSmallIssueSchema,
    ZodTooBigIssueSchema,
    ZodInvalidIntersectionTypesIssueSchema,
    ZodNotMultipleOfIssueSchema,
    ZodNotFiniteIssueSchema,
    ZodCustomIssueSchema,
  ])
  .openapi("ValidationError");

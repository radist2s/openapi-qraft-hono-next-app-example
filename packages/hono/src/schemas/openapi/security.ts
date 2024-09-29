export const accessSecuritySchema: SecurityRequirementObject[] = [
  { cookieAccessToken: [] },
  { bearerAccessToken: [] },
];

export const refreshSecuritySchema: SecurityRequirementObject[] = [
  { cookieRefreshToken: [] },
  { bearerRefreshToken: [] },
];

type SecuritySchemaName =
  | "cookieAccessToken"
  | "bearerAccessToken"
  | "cookieRefreshToken"
  | "bearerRefreshToken";

type SecurityRequirementObject = {
  [name in SecuritySchemaName]?: string[];
};

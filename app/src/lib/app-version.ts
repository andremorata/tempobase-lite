export const APP_VERSION =
  process.env.NEXT_PUBLIC_APP_VERSION ??
  `${process.env.NEXT_PUBLIC_APP_VERSION_BASE ?? "1.0"}.local`;

import type { Prisma } from "@prisma/client";

export function toNumber(
  value: Prisma.Decimal | number | null | undefined
): number {
  if (value == null) {
    return 0;
  }

  return typeof value === "number" ? value : value.toNumber();
}

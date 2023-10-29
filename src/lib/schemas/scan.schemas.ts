import { ScanSchema } from "./prisma";

export const insertScanSchema = ScanSchema.pick({
  name: true,
  description: true,
  logo: true,
  banner: true,
  website: true,
  discord: true,
  twitter: true,
  facebook: true,
  instagram: true,
  telegram: true,
  youtube: true,
  email: true,
});

export type InsertScanSchema = typeof insertScanSchema._type;

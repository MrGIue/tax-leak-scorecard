import fs from "fs";
import path from "path";
import { ScorecardConfig } from "./types";

const configDir = path.join(process.cwd(), "src", "configs");

export function getAllClientSlugs(): string[] {
  const files = fs.readdirSync(configDir);
  return files
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(".json", ""));
}

export function loadConfig(slug: string): ScorecardConfig | null {
  const filePath = path.join(configDir, `${slug}.json`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as ScorecardConfig;
}

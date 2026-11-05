import { appendFileSync } from "node:fs";
import { generateCard } from "../application/index.ts";
import { parseRequest } from "../domain/index.ts";
import type { RequestEnv } from "../domain/index.ts";
import { nodeFiles, renderCard } from "../infrastructure/index.ts";

/**
 * Runs the action: reads the inputs from the environment, draws the card, writes it, and reports `path` and `changed`
 * as outputs. The inputs reach this process as environment variables named `SOCIAL_CARD_<INPUT>`, never through the
 * command line, so a value cannot become a shell command.
 *
 * @param env - The environment of the job.
 * @param log - Where messages go. The default is the console.
 * @returns The exit code: 0 when the card was drawn, 1 when the inputs were wrong or the drawing failed.
 */
export async function run(
  env: Readonly<Record<string, string | undefined>>,
  log: (line: string) => void = console.log,
): Promise<number> {
  const inputs: Record<string, string | undefined> = {};
  for (const key of [
    "path",
    "name",
    "description",
    "host",
    "homepage",
    "repository",
    "background",
    "title",
    "text",
    "muted",
    "accent",
  ]) {
    inputs[key] = env[`SOCIAL_CARD_${key.toUpperCase()}`];
  }
  const parsed = parseRequest(inputs as RequestEnv);
  if (!parsed.ok) {
    log(`::error title=social-card-action::${parsed.error}`);
    return 1;
  }
  try {
    const files = nodeFiles(env.GITHUB_WORKSPACE || process.cwd());
    const result = await generateCard({ renderer: { render: renderCard }, files }, parsed.request);
    // The path is an input of the workflow, so it is reported as the `path` output and not repeated in the log.
    log(result.changed ? "Wrote the social card." : "The social card is already up to date.");
    if (env.GITHUB_OUTPUT) {
      appendFileSync(env.GITHUB_OUTPUT, `path=${result.path}\nchanged=${result.changed}\n`);
    }
    return 0;
  } catch (error) {
    log(
      `::error title=social-card-action::${error instanceof Error ? error.message : String(error)}`,
    );
    return 1;
  }
}

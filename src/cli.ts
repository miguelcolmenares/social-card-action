import { run } from "./presentation/index.ts";

process.exitCode = await run(process.env);

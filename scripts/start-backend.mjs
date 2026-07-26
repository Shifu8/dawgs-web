import { spawn } from "child_process";
import path from "path";
import fs from "fs";

const rootDir = process.cwd().endsWith("backend")
  ? path.resolve(process.cwd(), "..")
  : process.cwd();

const backendDir = path.join(rootDir, "backend");
const venvPython = path.join(rootDir, ".venv", "Scripts", "python.exe");

const pythonCmd = fs.existsSync(venvPython) ? venvPython : "python";

console.log(`Starting FastAPI Backend from: ${backendDir}`);
console.log(`Python binary: ${pythonCmd}`);

const proc = spawn(pythonCmd, ["-m", "uvicorn", "app.main:app", "--reload", "--port", "8000"], {
  cwd: backendDir,
  stdio: "inherit",
  shell: true,
});

proc.on("error", (err) => {
  console.error("Failed to start FastAPI backend:", err);
});

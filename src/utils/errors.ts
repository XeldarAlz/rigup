export class RigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RigError";
  }
}

export class ItemNotFoundError extends RigError {
  constructor(name: string) {
    super(`Item "${name}" not found in registry`);
    this.name = "ItemNotFoundError";
  }
}

export class RegistryFetchError extends RigError {
  constructor(url: string, cause?: Error) {
    super(`Failed to fetch from registry: ${url}`);
    this.name = "RegistryFetchError";
    if (cause) this.cause = cause;
  }
}

export class FileConflictError extends RigError {
  constructor(path: string) {
    super(`File conflict: "${path}" already exists`);
    this.name = "FileConflictError";
  }
}

export class SchemaValidationError extends RigError {
  constructor(message: string) {
    super(`Schema validation failed: ${message}`);
    this.name = "SchemaValidationError";
  }
}

export class ProjectNotFoundError extends RigError {
  constructor() {
    super(
      "Could not find project root. Run this command from a project directory (with .git or package.json)."
    );
    this.name = "ProjectNotFoundError";
  }
}

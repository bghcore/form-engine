import { Dictionary } from "../utils";
import { IBusinessRule } from "../types/IBusinessRule";
import { OrderDependencyMap } from "../types/IOrderDependencies";

export interface ICycleError {
  type: "dependency" | "order";
  fields: string[];
  message: string;
}

/**
 * Detects circular dependencies in field business rules using Kahn's algorithm.
 * Operates on the dependentFields/dependsOnFields adjacency lists
 * already built by GetDefaultBusinessRules.
 */
export function detectDependencyCycles(fieldRules: Dictionary<IBusinessRule>): ICycleError[] {
  const errors: ICycleError[] = [];
  const fields = Object.keys(fieldRules);

  // Build adjacency list and in-degree count from dependentFields
  const inDegree: Dictionary<number> = {};
  const adjacency: Dictionary<string[]> = {};

  for (const field of fields) {
    inDegree[field] = 0;
    adjacency[field] = [];
  }

  for (const field of fields) {
    const dependents = fieldRules[field]?.dependentFields ?? [];
    for (const dep of dependents) {
      if (dep in inDegree) {
        adjacency[field].push(dep);
        inDegree[dep]++;
      }
    }
  }

  // Kahn's algorithm: BFS topological sort
  const queue: string[] = [];
  for (const field of fields) {
    if (inDegree[field] === 0) {
      queue.push(field);
    }
  }

  const sorted: string[] = [];
  while (queue.length > 0) {
    const current = queue.shift()!;
    sorted.push(current);
    for (const neighbor of adjacency[current]) {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) {
        queue.push(neighbor);
      }
    }
  }

  // If not all fields were sorted, there's a cycle
  if (sorted.length < fields.length) {
    const cycleFields = fields.filter(f => !sorted.includes(f));
    errors.push({
      type: "dependency",
      fields: cycleFields,
      message: `Circular dependency detected among fields: ${cycleFields.join(", ")}`,
    });
  }

  // Also check combo dependencies for cycles
  const comboInDegree: Dictionary<number> = {};
  const comboAdjacency: Dictionary<string[]> = {};

  for (const field of fields) {
    comboInDegree[field] = 0;
    comboAdjacency[field] = [];
  }

  for (const field of fields) {
    const comboDeps = fieldRules[field]?.comboDependentFields ?? [];
    for (const dep of comboDeps) {
      if (dep in comboInDegree) {
        comboAdjacency[field].push(dep);
        comboInDegree[dep]++;
      }
    }
  }

  const comboQueue: string[] = [];
  for (const field of fields) {
    if (comboInDegree[field] === 0) {
      comboQueue.push(field);
    }
  }

  const comboSorted: string[] = [];
  while (comboQueue.length > 0) {
    const current = comboQueue.shift()!;
    comboSorted.push(current);
    for (const neighbor of comboAdjacency[current]) {
      comboInDegree[neighbor]--;
      if (comboInDegree[neighbor] === 0) {
        comboQueue.push(neighbor);
      }
    }
  }

  if (comboSorted.length < fields.length) {
    const cycleFields = fields.filter(f => !comboSorted.includes(f));
    errors.push({
      type: "dependency",
      fields: cycleFields,
      message: `Circular combo dependency detected among fields: ${cycleFields.join(", ")}`,
    });
  }

  return errors;
}

/**
 * Detects cycles in order dependencies by tracking visited fields
 * during recursive resolution.
 */
export function detectOrderDependencyCycles(
  orderDeps: OrderDependencyMap,
  fieldName: string,
  visited: Set<string> = new Set()
): ICycleError[] {
  const errors: ICycleError[] = [];

  if (visited.has(fieldName)) {
    errors.push({
      type: "order",
      fields: [...visited, fieldName],
      message: `Circular order dependency detected: ${[...visited, fieldName].join(" -> ")}`,
    });
    return errors;
  }

  visited.add(fieldName);

  for (const businessValue of Object.keys(orderDeps)) {
    const dep = orderDeps[businessValue];
    if (!Array.isArray(dep)) {
      // It's a nested OrderDependencyMap — recurse into sub-fields
      const subFieldName = Object.keys(dep)[0];
      if (subFieldName) {
        const subDeps = dep[subFieldName];
        if (subDeps && !Array.isArray(subDeps)) {
          const subErrors = detectOrderDependencyCycles(
            subDeps as OrderDependencyMap,
            subFieldName,
            new Set(visited)
          );
          errors.push(...subErrors);
        }
      }
    }
  }

  return errors;
}

/**
 * Validates the full dependency graph of field rules.
 * Intended to be called at the end of GetDefaultBusinessRules().
 * Logs warnings in development, returns errors for programmatic use.
 */
export function validateDependencyGraph(fieldRules: Dictionary<IBusinessRule>): ICycleError[] {
  const errors: ICycleError[] = [];

  // Check field dependency cycles
  errors.push(...detectDependencyCycles(fieldRules));

  // Check order dependency cycles
  for (const fieldName of Object.keys(fieldRules)) {
    if (fieldRules[fieldName]?.pivotalRootField === fieldName) {
      // This field has order dependencies — check for cycles
      // We'd need the original orderDependencies from fieldConfigs,
      // but since we only have fieldRules here, we check the
      // orderDependentFields for self-references
      const orderDeps = fieldRules[fieldName]?.orderDependentFields ?? [];
      if (orderDeps.includes(fieldName)) {
        errors.push({
          type: "order",
          fields: [fieldName],
          message: `Field "${fieldName}" has a self-referencing order dependency`,
        });
      }
    }
  }

  // Log warnings in development
  try {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (typeof globalThis !== "undefined" && (globalThis as Record<string, unknown>).__DEV__ !== false) {
      for (const error of errors) {
        console.warn(`[dynamic-forms] ${error.message}`);
      }
    }
  } catch {
    // Silently ignore if environment check fails
  }

  return errors;
}

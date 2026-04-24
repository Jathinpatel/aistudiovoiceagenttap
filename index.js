const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

function loadEnvFile(fileName) {
  const filePath = path.join(__dirname, fileName);

  if (!fs.existsSync(filePath)) {
    return;
  }

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();

    if (key && !process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(".env");
loadEnvFile(".env.example");

const USER_ID = process.env.USER_ID || "JathinPatel_07112005";
const EMAIL_ID = process.env.EMAIL_ID || "js0273@srmist.edu.in";
const COLLEGE_ROLL_NUMBER =
  process.env.COLLEGE_ROLL_NUMBER || "RA2311003050426";

function isValidEdge(entry) {
  return /^[A-Z]->[A-Z]$/.test(entry);
}

function buildTree(root, adjacency) {
  const children = adjacency[root] || [];
  const branch = {};

  for (const child of children) {
    branch[child] = buildTree(child, adjacency);
  }

  return branch;
}

function detectCycle(componentNodes, adjacency) {
  const color = new Map();

  for (const node of componentNodes) {
    color.set(node, 0);
  }

  function dfs(node) {
    color.set(node, 1);

    for (const child of adjacency[node] || []) {
      if (!componentNodes.has(child)) {
        continue;
      }

      if (color.get(child) === 1) {
        return true;
      }

      if (color.get(child) === 0 && dfs(child)) {
        return true;
      }
    }

    color.set(node, 2);
    return false;
  }

  for (const node of componentNodes) {
    if (color.get(node) === 0 && dfs(node)) {
      return true;
    }
  }

  return false;
}

function calculateDepth(root, adjacency) {
  const children = adjacency[root] || [];

  if (children.length === 0) {
    return 1;
  }

  return 1 + Math.max(...children.map((child) => calculateDepth(child, adjacency)));
}

function getConnectedComponents(allNodes, adjacency, parentMap) {
  const visited = new Set();
  const components = [];

  for (const start of allNodes) {
    if (visited.has(start)) {
      continue;
    }

    const stack = [start];
    const component = new Set();

    while (stack.length > 0) {
      const node = stack.pop();

      if (component.has(node)) {
        continue;
      }

      component.add(node);

      for (const child of adjacency[node] || []) {
        stack.push(child);
      }

      if (parentMap.has(node)) {
        stack.push(parentMap.get(node));
      }
    }

    for (const node of component) {
      visited.add(node);
    }

    components.push(component);
  }

  return components;
}

function parseAndProcess(data) {
  const validEdges = [];
  const invalidEntries = [];
  const duplicateEdges = [];
  const seenEdges = new Set();

  for (const rawEntry of data) {
    if (typeof rawEntry !== "string") {
      invalidEntries.push(String(rawEntry));
      continue;
    }

    const entry = rawEntry.trim();

    if (!isValidEdge(entry)) {
      invalidEntries.push(rawEntry);
      continue;
    }

    const [parent, child] = entry.split("->");

    if (parent === child) {
      invalidEntries.push(rawEntry);
      continue;
    }

    if (seenEdges.has(entry)) {
      if (!duplicateEdges.includes(entry)) {
        duplicateEdges.push(entry);
      }
      continue;
    }

    seenEdges.add(entry);
    validEdges.push([parent, child]);
  }

  const parentMap = new Map();
  const adjacency = {};
  const allNodes = new Set();

  for (const [parent, child] of validEdges) {
    allNodes.add(parent);
    allNodes.add(child);

    if (parentMap.has(child)) {
      continue;
    }

    parentMap.set(child, parent);

    if (!adjacency[parent]) {
      adjacency[parent] = [];
    }

    adjacency[parent].push(child);
  }

  const components = getConnectedComponents(allNodes, adjacency, parentMap);
  const hierarchies = [];

  for (const component of components) {
    const hasCycle = detectCycle(component, adjacency);

    if (hasCycle) {
      const root = [...component].sort()[0];
      hierarchies.push({
        root,
        tree: {},
        has_cycle: true,
      });
      continue;
    }

    const roots = [...component]
      .filter((node) => !parentMap.has(node))
      .sort((a, b) => a.localeCompare(b));

    for (const root of roots) {
      const depth = calculateDepth(root, adjacency);

      hierarchies.push({
        root,
        tree: {
          [root]: buildTree(root, adjacency),
        },
        depth,
      });
    }
  }

  const trees = hierarchies.filter((item) => !item.has_cycle);
  const cycles = hierarchies.filter((item) => item.has_cycle);

  let largestTreeRoot = "";

  if (trees.length > 0) {
    const sortedTrees = [...trees].sort((left, right) => {
      if (right.depth !== left.depth) {
        return right.depth - left.depth;
      }

      return left.root.localeCompare(right.root);
    });

    largestTreeRoot = sortedTrees[0].root;
  }

  return {
    user_id: USER_ID,
    email_id: EMAIL_ID,
    college_roll_number: COLLEGE_ROLL_NUMBER,
    hierarchies,
    invalid_entries: invalidEntries,
    duplicate_edges: duplicateEdges,
    summary: {
      total_trees: trees.length,
      total_cycles: cycles.length,
      largest_tree_root: largestTreeRoot,
    },
  };
}

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "frontend.html"));
});

app.get("/api", (_req, res) => {
  res.json({
    status: "ok",
    message: "BFHL API is running",
  });
});

app.get("/health", (_req, res) => {
  res.json({ healthy: true });
});

app.post("/bfhl", (req, res) => {
  try {
    const { data } = req.body;

    if (!Array.isArray(data)) {
      return res.status(400).json({
        error: '"data" must be an array of strings',
      });
    }

    const result = parseAndProcess(data);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`BFHL API server running on port ${PORT}`);
});

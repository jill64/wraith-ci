"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// ../shared/src/schema.ts
var schema = {
  build: {
    alias: "Build",
    trigger: "push"
  },
  deploy: {
    alias: "Deploy",
    trigger: "push_main"
  },
  docs: {
    alias: "Docs",
    trigger: "push"
  },
  format: {
    alias: "Format",
    trigger: "push",
    skip_bot: true
  },
  lint: {
    alias: "Lint",
    trigger: "push"
  },
  merge: {
    alias: "Auto Merge",
    trigger: "pull_request"
  },
  release: {
    alias: "Release",
    trigger: "push_main"
  },
  bump: {
    alias: "Version Bump",
    trigger: "pull_request"
  },
  assign: {
    alias: "Reviewer Assign",
    trigger: "pull_request"
  }
};

// src/index.ts
var import_attempt3 = require("@jill64/attempt");
var import_unfurl = require("@jill64/unfurl");
var import_action = require("octoflare/action");
var core9 = __toESM(require("octoflare/action/core"), 1);
var import_typescanner8 = require("typescanner");

// src/ghosts/assign.ts
var assign = async ({ payload, octokit }) => {
  const {
    repo,
    owner,
    data: { pull_number }
  } = payload;
  if (!pull_number) {
    return "skipped";
  }
  const { data: pull_request } = await octokit.rest.pulls.get({
    owner,
    repo,
    pull_number
  });
  if (pull_request.user.login === owner) {
    return {
      status: "skipped",
      reason: "Pull Request is by Owner"
    };
  }
  if (pull_request.requested_reviewers?.some(
    (user) => "login" in user && user.login === owner
  )) {
    return {
      status: "skipped",
      reason: "Owner is already a reviewer"
    };
  }
  await octokit.rest.pulls.requestReviewers({
    owner,
    repo,
    pull_number: pull_request.number,
    reviewers: [
      ...(pull_request.requested_reviewers ?? []).map((user) => user.login),
      owner
    ]
  });
  return "success";
};

// src/ghosts/build.ts
var import_typescanner = require("typescanner");

// src/utils/getPackageJson.ts
var import_promises = require("node:fs/promises");
var getPackageJson = async () => {
  try {
    const packageJson = await (0, import_promises.readFile)("package.json", "utf-8");
    return JSON.parse(packageJson);
  } catch {
    return null;
  }
};

// src/utils/gitDiff.ts
var import_exec2 = __toESM(require("@actions/exec"), 1);

// src/utils/run.ts
var import_exec = require("@actions/exec");
var run = (cmd) => (0, import_exec.getExecOutput)(cmd, void 0, {
  ignoreReturnCode: true
});

// src/utils/gitDiff.ts
var gitDiff = async () => {
  await run("git add -N .");
  const diff = await import_exec2.default.exec("git diff --exit-code", void 0, {
    ignoreReturnCode: true,
    silent: true
  });
  return diff;
};

// src/utils/pushCommit.ts
var import_exec3 = require("@actions/exec");
var pushCommit = async (message) => {
  await (0, import_exec3.exec)("git config user.name wraith-ci[bot]");
  await (0, import_exec3.exec)("git config user.email wraith-ci[bot]@users.noreply.github.com");
  await (0, import_exec3.exec)("git add .");
  await (0, import_exec3.exec)("git commit", ["-m", message]);
  await (0, import_exec3.exec)("git pull --rebase");
  await (0, import_exec3.exec)("git push origin");
};

// src/ghosts/build.ts
var isValidJson = (0, import_typescanner.scanner)({
  scripts: (0, import_typescanner.scanner)({
    build: import_typescanner.string
  })
});
var build = async () => {
  const package_json = await getPackageJson();
  if (!package_json) {
    return {
      status: "skipped",
      detail: "Not found package.json in repo"
    };
  }
  if (!isValidJson(package_json)) {
    return {
      status: "skipped",
      detail: "Build command not found in package.json"
    };
  }
  const result = await run("npm run build");
  if (result.exitCode !== 0) {
    return {
      status: "failure",
      detail: result.stderr
    };
  }
  const diff = await gitDiff();
  if (diff === 0) {
    return "success";
  }
  await pushCommit("chore: regenerate artifact");
  return {
    status: "failure",
    detail: "The updated artifact will be pushed shortly"
  };
};

// src/ghosts/bump/index.ts
var import_semver2 = __toESM(require("semver"), 1);
var import_typescanner2 = require("typescanner");

// src/utils/getFile.ts
var import_node_buffer = require("node:buffer");
var core = __toESM(require("octoflare/action/core"), 1);
var getFile = async ({
  octokit,
  owner,
  repo,
  path: path6,
  ref
}) => {
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: path6,
      ref
    });
    if (!("type" in data && data.type === "file")) {
      return null;
    }
    const buff = import_node_buffer.Buffer.from(data.content, data.encoding);
    return buff.toString();
  } catch (e) {
    core.error(e instanceof Error ? e : new Error(JSON.stringify(e, null, 2)));
    return null;
  }
};

// src/ghosts/bump/checkCumulativeUpdate.ts
var thresh = 20;
var checkCumulativeUpdate = async ({
  repo,
  owner,
  default_branch,
  octokit
}) => {
  const [
    {
      data: { published_at }
    },
    { data: list }
  ] = await Promise.all([
    octokit.rest.repos.getLatestRelease({
      owner,
      repo
    }),
    octokit.rest.pulls.list({
      owner,
      repo,
      state: "closed",
      base: default_branch,
      per_page: thresh
    })
  ]);
  const publishedUNIX = published_at ? new Date(published_at).getTime() : 0;
  if (!publishedUNIX) {
    return false;
  }
  if (list.length < thresh) {
    return false;
  }
  return list.every(
    (pull) => pull.merged_at ? new Date(pull.merged_at).getTime() > publishedUNIX : false
  );
};

// src/ghosts/bump/determineSemType.ts
var determineSemType = (title) => {
  const str = title.toLocaleLowerCase();
  if (str.startsWith("breaking:")) {
    return "major";
  }
  if (title.startsWith("major:")) {
    return "major";
  }
  if (title.startsWith("minor:")) {
    return "minor";
  }
  if (title.startsWith("feat:")) {
    return "minor";
  }
  return "patch";
};

// src/ghosts/bump/formatVersionStr.ts
var import_semver = __toESM(require("semver"), 1);
var formatVersionStr = (str) => {
  const trimmed = str?.trim();
  const ver = trimmed && trimmed !== "null" ? import_semver.default.clean(trimmed) : null;
  return ver ?? "0.0.0";
};

// src/ghosts/bump/overwriteAllVersion.ts
var import_promises3 = require("node:fs/promises");

// src/utils/findFile.ts
var import_promises2 = require("node:fs/promises");
var import_node_path = __toESM(require("node:path"), 1);
var core2 = __toESM(require("octoflare/action/core"), 1);
var findFile = async (filename) => {
  const all = await (0, import_promises2.readdir)(process.cwd(), {
    withFileTypes: true,
    recursive: true
  });
  const files = all.filter(
    (file) => file.isFile() && !file.path.includes("node_modules/") && file.name === filename
  ).map((file) => import_node_path.default.join(file.path, file.name));
  core2.info(`[search "${filename}"]: ${JSON.stringify(files, null, 2)}}`);
  return files;
};

// src/ghosts/bump/overwriteAllVersion.ts
var core3 = __toESM(require("octoflare/action/core"), 1);
var overwriteAllVersion = async (newVersion) => {
  const files = await findFile("package.json");
  core3.info(`Detected package.json files: ${JSON.stringify(files, null, 2)}`);
  await Promise.allSettled(
    files.map(async (file) => {
      const str = await (0, import_promises3.readFile)(file, "utf-8");
      const json = JSON.parse(str);
      if (!json.version) {
        core3.info(`No version found in ${file}`);
        return;
      }
      const newJsonStr = JSON.stringify(
        {
          ...json,
          version: newVersion
        },
        null,
        2
      );
      await (0, import_promises3.writeFile)(file, newJsonStr);
    })
  );
};

// src/ghosts/bump/index.ts
var isPackageJson = (0, import_typescanner2.scanner)({
  version: import_typescanner2.string
});
var bump = async ({ payload, octokit }) => {
  const {
    owner,
    repo,
    data: { pull_number }
  } = payload;
  if (!pull_number) {
    return {
      status: "skipped",
      detail: "No pull request number found."
    };
  }
  const headJson = await getPackageJson();
  if (!isPackageJson(headJson)) {
    return {
      status: "skipped",
      detail: "No package.json found."
    };
  }
  if (!headJson?.version) {
    return {
      status: "skipped",
      detail: "No version found."
    };
  }
  const [
    { data: pull_request },
    {
      data: { default_branch }
    }
  ] = await Promise.all([
    octokit.rest.pulls.get({
      owner,
      repo,
      pull_number
    }),
    octokit.rest.repos.get({
      owner,
      repo
    })
  ]);
  if (pull_request.base.ref !== default_branch) {
    return {
      status: "skipped",
      detail: "PR is not targeting default branch."
    };
  }
  const isChore = pull_request.title.startsWith("chore");
  const cumulativeUpdate = isChore ? await checkCumulativeUpdate({ owner, repo, default_branch, octokit }) : false;
  if (isChore && !cumulativeUpdate) {
    return {
      status: "skipped",
      detail: "PR is not a cumulative update."
    };
  }
  const baseStr = await getFile({
    repo,
    owner,
    ref: pull_request.base.ref,
    path: "package.json",
    octokit
  });
  const baseJsonData = baseStr ? JSON.parse(baseStr) : null;
  const baseJson = isPackageJson(baseJsonData) ? baseJsonData : null;
  if (!baseJson?.version) {
    return {
      status: "skipped",
      detail: "No base version found."
    };
  }
  const base_version = formatVersionStr(baseJson?.version);
  const head_version = formatVersionStr(headJson.version);
  const semType = cumulativeUpdate ? "patch" : determineSemType(pull_request.title);
  const newVersion = import_semver2.default.inc(base_version, semType) ?? head_version;
  if (import_semver2.default.eq(head_version, newVersion)) {
    return "success";
  }
  await overwriteAllVersion(newVersion);
  await run("npm run format");
  await pushCommit(`chore: bump to ${newVersion}`);
  if (cumulativeUpdate) {
    await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: pull_request.number,
      body: `This PR has automatically bumped its version to \`${newVersion}\`, because it has reached the cumulative update threshold.`
    });
  }
  return {
    status: "failure",
    detail: `Auto Bump \`${head_version}\` => \`${newVersion}\``
  };
};

// src/ghosts/deploy.ts
var import_typescanner3 = require("typescanner");
var isValidJson2 = (0, import_typescanner3.scanner)({
  scripts: (0, import_typescanner3.scanner)({
    deploy: import_typescanner3.string
  })
});
var deploy = async () => {
  const package_json = await getPackageJson();
  if (!package_json) {
    return {
      status: "skipped",
      detail: "Not found package.json in repo"
    };
  }
  if (!isValidJson2(package_json)) {
    return {
      status: "skipped",
      detail: "Deploy command not found in package.json"
    };
  }
  const result = await run("npm run deploy");
  if (result.exitCode === 0) {
    return "success";
  }
  return {
    status: "failure",
    detail: result.stderr
  };
};

// src/ghosts/docs/updatePackageJsonList.ts
var core5 = __toESM(require("octoflare/action/core"), 1);

// src/ghosts/docs/updatePackageJson.ts
var import_promises4 = require("node:fs/promises");
var import_node_path2 = __toESM(require("node:path"), 1);
var core4 = __toESM(require("octoflare/action/core"), 1);

// src/ghosts/docs/utils/isValidPackageJson.ts
var import_typescanner4 = require("typescanner");
var isValidPackageJson = (0, import_typescanner4.scanner)({
  name: (0, import_typescanner4.optional)(import_typescanner4.string),
  version: (0, import_typescanner4.optional)(import_typescanner4.string),
  files: (0, import_typescanner4.optional)((0, import_typescanner4.array)(import_typescanner4.string)),
  description: (0, import_typescanner4.optional)(import_typescanner4.string),
  license: (0, import_typescanner4.optional)(import_typescanner4.string)
});

// src/ghosts/docs/updatePackageJson.ts
var updatePackageJson = ({
  repository,
  repoLevelConfig
}) => async (packageJsonPath) => {
  const packageJsonStr = await (0, import_promises4.readFile)(packageJsonPath, "utf-8");
  const json = JSON.parse(packageJsonStr);
  const packageJson = isValidPackageJson(json) ? json : null;
  if (!packageJson?.version) {
    core4.info(`[${packageJsonPath}]: No version found.`);
    return false;
  }
  if (!packageJson?.name) {
    core4.info(`[${packageJsonPath}]: No name found.`);
    return false;
  }
  const relative = import_node_path2.default.relative(process.cwd(), packageJsonPath);
  const relativeDir = import_node_path2.default.dirname(relative);
  const isRepoRoot = relative === "package.json";
  const homepage = `${repository.html_url}${relativeDir === "." ? "" : relativeDir}#readme`;
  const publishConfig = packageJson.name?.startsWith("@") ? { publishConfig: { access: "public" } } : {};
  const description = isRepoRoot ? { description: repository.description } : {};
  const keywords = isRepoRoot ? { keywords: repository.topics ?? [] } : {};
  const repoInfo = {
    homepage,
    ...repoLevelConfig,
    ...description,
    ...publishConfig,
    ...keywords
  };
  const oldJson = JSON.stringify(packageJson, null, 2);
  const newJson = JSON.stringify(
    {
      ...packageJson,
      ...repoInfo
    },
    null,
    2
  );
  if (oldJson === newJson) {
    core4.info(`[${packageJsonPath}]: No changes.`);
    return false;
  }
  await (0, import_promises4.writeFile)(packageJsonPath, newJson + "\n");
  return true;
};

// src/ghosts/docs/updatePackageJsonList.ts
var updatePackageJsonList = async ({
  repository
}) => {
  const { owner } = repository;
  const [files, html] = await Promise.all([
    findFile("package.json"),
    fetch(repository.html_url).then((res) => res.text()).catch((e) => {
      core5.error(e);
      return "";
    })
  ]);
  const repoImage = html.match(/<meta property="og:image" content="(\S*)"\s*\/>/)?.[1] ?? "";
  const license = repository.license?.spdx_id ? { license: repository.license.spdx_id } : {};
  const repoLevelConfig = {
    ...license,
    bugs: `${repository.html_url}/issues`,
    author: {
      name: owner.login,
      email: owner.email ?? "contact@jill64.dev",
      url: owner.html_url,
      image: owner.avatar_url
    },
    repository: {
      type: "git",
      url: repository.clone_url,
      image: repoImage
    },
    prettier: "@jill64/prettier-config"
  };
  const result = await Promise.all(
    files.map(updatePackageJson({ repository, repoLevelConfig }))
  );
  if (!result.includes(true)) {
    return;
  }
  await run("npm run format");
  const diff = await gitDiff();
  if (diff) {
    await pushCommit("chore: synchronize package.json");
  }
};

// src/ghosts/docs/updateReadme.ts
var import_promises5 = require("node:fs/promises");
var import_node_path3 = __toESM(require("node:path"), 1);
var core6 = __toESM(require("octoflare/action/core"), 1);

// src/ghosts/docs/utils/snippets.ts
var BEGIN_FIRST = "<!----- BEGIN GHOST DOCS";
var END_FIRST = "<!----- END GHOST DOCS";
var LAST_TAIL = "----->";
var tagBegin = (tag) => `${BEGIN_FIRST} ${tag} ${LAST_TAIL}`;
var tagEnd = (tag) => `${END_FIRST} ${tag} ${LAST_TAIL}`;

// src/ghosts/docs/utils/insertSection.ts
var insertSection = (readme) => {
  const beginHeader = tagBegin("HEADER");
  const endHeader = tagEnd("HEADER");
  const beginFooter = tagBegin("FOOTER");
  const endFooter = tagEnd("FOOTER");
  const headed = !readme.includes(beginHeader) || !readme.includes(endHeader) ? `${beginHeader}

${endHeader}

${readme}
` : readme;
  const footed = !headed.includes(beginFooter) || !headed.includes(endFooter) ? `${headed}
${beginFooter}
${endFooter}
` : headed;
  return footed;
};

// src/ghosts/docs/utils/replaceSection.ts
var replaceSection = ({
  source,
  section,
  content
}) => {
  const begin = new RegExp(tagBegin(section));
  const end = new RegExp(tagEnd(section));
  const beginMatch = source.match(begin);
  const endMatch = source.match(end);
  if (!(beginMatch?.index !== void 0 && endMatch?.index !== void 0)) {
    return source;
  }
  const beginIndex = beginMatch.index;
  const endIndex = endMatch.index + endMatch[0].length;
  return source.substring(0, beginIndex) + `${beginMatch[0]}
${content}
${endMatch[0]}` + source.substring(endIndex);
};

// src/ghosts/docs/utils/badge.ts
var badge = (href) => ({ src, alt }) => (
  /* html */
  `<a href="${href}"><img src="${src}" alt="${alt}" /></a>`
);

// src/ghosts/docs/utils/syncHeader.ts
var syncHeader = ({
  readme,
  packageJson,
  repository,
  workflowFiles
}) => {
  const escapedWebsiteUrl = repository.homepage ? encodeURIComponent(repository.homepage) : "";
  const repoURL = repository.homepage ? new URL(repository.homepage) : null;
  const jillOssPage = repoURL?.origin.endsWith("jill64.dev");
  const siteBadge = jillOssPage && repository.homepage ? badge(repository.homepage)({
    alt: "website",
    src: `https://img.shields.io/website?up_message=working&down_message=down&url=${escapedWebsiteUrl}`
  }) : "";
  const workflowBadges = workflowFiles.map(
    (file) => badge(
      `https://github.com/${repository.full_name}/actions/workflows/${file.name}`
    )({
      alt: file.name,
      src: `https://github.com/${repository.full_name}/actions/workflows/${file.name}/badge.svg`
    })
  );
  const packageName = packageJson?.name?.trim();
  const npmLink = packageName ? `https://npmjs.com/package/${packageName}` : "";
  const npmBadge = badge(npmLink);
  const versionBadge = npmBadge({
    alt: "npm-version",
    src: `https://img.shields.io/npm/v/${packageName}`
  });
  const licenseBadge = npmBadge({
    alt: "npm-license",
    src: `https://img.shields.io/npm/l/${packageName}`
  });
  const downloadBadge = npmBadge({
    alt: "npm-download-month",
    src: `https://img.shields.io/npm/dm/${packageName}`
  });
  const bundleSizeBadge = npmBadge({
    alt: "npm-min-size",
    src: `https://img.shields.io/bundlephobia/min/${packageName}`
  });
  const npmBadges = packageName && packageJson?.version ? [versionBadge, licenseBadge, downloadBadge, bundleSizeBadge] : [];
  const badges = `
${tagBegin("BADGES")}
${[
    ...npmBadges,
    ...workflowBadges,
    // codecovBadge,
    siteBadge
  ].filter((x) => x).join(" ")}
${tagEnd("BADGES")}
`;
  const demoSection = jillOssPage ? `## [Demo](${repository.homepage})` : "";
  const content = [
    `# ${packageName ?? repository.name}`,
    badges,
    (packageJson?.description ?? repository.description ?? "").trim(),
    demoSection
  ].filter((x) => x).join("\n\n").trim();
  return replaceSection({
    source: readme,
    section: "HEADER",
    content: `
${content}
`
  });
};

// src/ghosts/docs/updateReadme.ts
var updateReadme = ({
  repository,
  workflowFiles
}) => async (readmePath) => {
  const readme = await (0, import_promises5.readFile)(readmePath, "utf-8");
  const dir = import_node_path3.default.dirname(readmePath);
  const packageJsonPath = import_node_path3.default.join(dir, "package.json");
  const packageJsonStr = await (0, import_promises5.readFile)(packageJsonPath, "utf-8");
  const json = JSON.parse(packageJsonStr);
  const packageJson = isValidPackageJson(json) ? json : null;
  const isRepoRoot = import_node_path3.default.relative(process.cwd(), readmePath) === "README.md";
  const headerSynced = syncHeader({
    workflowFiles,
    packageJson,
    readme: insertSection(readme),
    repository
  });
  const license = isRepoRoot ? repository.license?.spdx_id : packageJson?.license;
  const newReadme = license ? replaceSection({
    source: headerSynced,
    section: "FOOTER",
    content: `
## License

[${license}](LICENSE)
`
  }) : readme;
  if (readme === newReadme) {
    core6.info(`[${readmePath}]: No update found.`);
    return false;
  }
  await (0, import_promises5.writeFile)(readmePath, newReadme);
  return true;
};

// src/ghosts/docs/updateReadmeList.ts
var updateReadmeList = async ({
  repository,
  workflowFiles
}) => {
  const files = await findFile("README.md");
  const result = await Promise.all(
    files.map(
      updateReadme({
        repository,
        workflowFiles
      })
    )
  );
  if (!result.includes(true)) {
    return;
  }
  await run("npm run format");
  const diff = await gitDiff();
  if (diff) {
    await pushCommit("chore: synchronize README.md");
  }
};

// src/ghosts/docs/utils/listWorkflowFiles.ts
var import_attempt = require("@jill64/attempt");
var import_promises6 = require("node:fs/promises");
var import_node_path4 = __toESM(require("node:path"), 1);
var listWorkflowFiles = async () => {
  const dirPath = import_node_path4.default.join(process.cwd(), ".github/workflows");
  const dir = await (0, import_attempt.attempt)(
    () => (0, import_promises6.readdir)(dirPath, {
      withFileTypes: true,
      recursive: true
    }),
    []
  );
  const result = dir.filter((dirent) => dirent.isFile()).map(async (file) => {
    const filepath = import_node_path4.default.join(dirPath, file.name);
    const data = await (0, import_promises6.readFile)(filepath, "utf-8");
    return {
      name: file.name,
      data
    };
  });
  const list = await Promise.all(result);
  return list;
};

// src/ghosts/docs/index.ts
var docs = async ({
  payload: {
    owner,
    repo,
    data: { ref }
  },
  octokit
}) => {
  const [{ data: repository }, workflowFiles] = await Promise.all([
    octokit.rest.repos.get({
      owner,
      repo
    }),
    listWorkflowFiles()
  ]);
  if (ref === repository.default_branch) {
    return "skipped";
  }
  await Promise.allSettled([
    updateReadmeList({ repository, workflowFiles }),
    updatePackageJsonList({ repository })
  ]);
  return "success";
};

// src/ghosts/format.ts
var import_typescanner5 = require("typescanner");
var isValidJson3 = (0, import_typescanner5.scanner)({
  scripts: (0, import_typescanner5.scanner)({
    format: import_typescanner5.string
  })
});
var format = async () => {
  const package_json = await getPackageJson();
  if (!package_json) {
    return {
      status: "skipped",
      detail: "Not found package.json in repo"
    };
  }
  if (!isValidJson3(package_json)) {
    return {
      status: "skipped",
      detail: "Format command not found in package.json"
    };
  }
  const formatResult = await run("npm run format");
  if (formatResult.exitCode !== 0) {
    return {
      status: "failure",
      detail: formatResult.stderr
    };
  }
  const diff = await gitDiff();
  if (diff === 0) {
    return "success";
  }
  await pushCommit("chore: format");
  return {
    status: "failure",
    detail: "Formatted code has been pushed."
  };
};

// src/ghosts/lint.ts
var import_promises7 = require("fs/promises");
var import_typescanner6 = require("typescanner");
var isValidJson4 = (0, import_typescanner6.scanner)({
  scripts: (0, import_typescanner6.scanner)({
    lint: import_typescanner6.string
  })
});
var lint = async () => {
  const package_json = await getPackageJson();
  if (!package_json) {
    return {
      status: "skipped",
      detail: "Not found package.json in repo"
    };
  }
  if (!isValidJson4(package_json)) {
    return {
      status: "skipped",
      detail: "Lint command not found in package.json"
    };
  }
  const lintResult = await run("npm run lint");
  if (lintResult.exitCode === 0) {
    return "success";
  }
  const isDepcheckError = lintResult.stdout.includes("Unused dependencies") || lintResult.stdout.includes("Unused devDependencies");
  if (isDepcheckError) {
    const isValidPackageJson2 = (0, import_typescanner6.scanner)({
      dependencies: (0, import_typescanner6.optional)((0, import_typescanner6.scanner)({})),
      devDependencies: (0, import_typescanner6.optional)((0, import_typescanner6.scanner)({}))
    });
    if (!isValidPackageJson2(package_json)) {
      return {
        status: "failure",
        detail: "Invalid Package.json"
      };
    }
    const depcheckResult = await run("npx depcheck --json");
    const result = JSON.parse(depcheckResult.stdout);
    const isValidResult = (0, import_typescanner6.scanner)({
      dependencies: (0, import_typescanner6.array)(import_typescanner6.string),
      devDependencies: (0, import_typescanner6.array)(import_typescanner6.string)
    });
    if (!isValidResult(result)) {
      return {
        status: "failure",
        detail: "Invalid Depcheck Result"
      };
    }
    const omittedDeps = Object.fromEntries(
      Object.entries(package_json.dependencies ?? {}).filter(
        ([key]) => !result.dependencies.includes(key)
      )
    );
    const omittedDevDeps = Object.fromEntries(
      Object.entries(package_json.devDependencies ?? {}).filter(
        ([key]) => !result.devDependencies.includes(key)
      )
    );
    const omittedPackageJson = {
      ...package_json,
      ...Object.keys(omittedDeps).length ? { dependencies: omittedDeps } : {},
      ...Object.keys(omittedDevDeps).length ? { devDependencies: omittedDevDeps } : {}
    };
    await (0, import_promises7.writeFile)("package.json", JSON.stringify(omittedPackageJson, null, 2));
    await pushCommit("fix: omit unused dependencies");
    return {
      status: "failure",
      detail: "New package.json has been pushed"
    };
  }
  return {
    status: "failure",
    detail: lintResult.stderr
  };
};

// src/ghosts/merge/index.ts
var import_attempt2 = require("@jill64/attempt");

// src/ghosts/merge/enableAutoMerge.ts
var enableAutoMerge = async ({
  repo,
  owner,
  octokit,
  pull_number
}) => {
  const {
    repository: {
      pullRequest: { id: pullRequestId }
    }
  } = await octokit.graphql(
    /* GraphQL */
    `
    query Query {
      repository(name: "${repo}", owner: "${owner}") {
        pullRequest(number: ${pull_number}) {
          id
        }
      }
    }
  `
  );
  try {
    await octokit.graphql(
      /* GraphQL */
      `
    mutation MyMutation {
      enablePullRequestAutoMerge(input: { pullRequestId: "${pullRequestId}" }) {
        clientMutationId
      }
    }
  `
    );
  } catch {
    throw new Error("Failed to enable auto merge");
  }
};

// src/ghosts/merge/isAllowedUsers.ts
var defaultAllowUsers = ["dependabot[bot]", "renovate[bot]", "wraith-ci[bot]"];
var isAllowUsers = async ({
  name,
  owner,
  octokit,
  ownerType
}) => {
  if (!name) {
    throw new Error("name is undefined");
  }
  if (defaultAllowUsers.includes(name)) {
    return true;
  }
  if (name === owner) {
    return true;
  }
  if (ownerType !== "Organization") {
    return false;
  }
  const {
    data: { role }
  } = await octokit.rest.orgs.getMembershipForUser({
    org: owner,
    username: name
  });
  return role === "admin";
};

// src/ghosts/merge/index.ts
var merge = async ({ payload, octokit }) => {
  const {
    owner,
    repo,
    data: { pull_number }
  } = payload;
  if (!pull_number) {
    return "skipped";
  }
  const [{ data: pull_request }, { data: repository }] = await Promise.all([
    octokit.rest.pulls.get({
      owner,
      repo,
      pull_number
    }),
    octokit.rest.repos.get({
      owner,
      repo
    })
  ]);
  const allow = await isAllowUsers({
    owner,
    octokit,
    name: pull_request.user.login,
    ownerType: repository.owner.type
  });
  if (!allow) {
    return {
      status: "skipped",
      detail: "This user is not allowed to merge"
    };
  }
  const branch_protection = await (0, import_attempt2.attempt)(
    () => octokit.rest.repos.getBranchProtection({
      owner,
      repo,
      branch: pull_request.base.ref
    }),
    null
  );
  if (!branch_protection?.data.required_status_checks?.contexts.length) {
    return {
      status: "skipped",
      detail: "This repository does not have required status checks"
    };
  }
  await enableAutoMerge({
    repo,
    owner,
    octokit,
    pull_number: pull_request.number
  });
  return "success";
};

// src/ghosts/release/index.ts
var import_exec5 = __toESM(require("@actions/exec"), 1);

// src/ghosts/release/npmPublish.ts
var import_exec4 = __toESM(require("@actions/exec"), 1);
var import_promises8 = require("node:fs/promises");
var import_node_path5 = __toESM(require("node:path"), 1);
var core7 = __toESM(require("octoflare/action/core"), 1);
var import_typescanner7 = require("typescanner");
var isValidJson5 = (0, import_typescanner7.scanner)({
  name: import_typescanner7.string,
  version: import_typescanner7.string,
  keywords: (0, import_typescanner7.optional)((0, import_typescanner7.array)(import_typescanner7.string))
});
var npmPublish = async (file) => {
  const cwd = import_node_path5.default.dirname(file);
  const str = await (0, import_promises8.readFile)(file, "utf-8");
  const package_json = JSON.parse(str);
  if (!isValidJson5(package_json)) {
    core7.info(`[${file}]: No version found.`);
    return false;
  }
  const version = package_json.version.trim();
  const publishedVersion = await import_exec4.default.getExecOutput(
    "npm view . version",
    void 0,
    {
      cwd,
      ignoreReturnCode: true
    }
  );
  if (version === publishedVersion.stdout.trim()) {
    core7.info(`[${file}]: No update found.`);
    return false;
  }
  await import_exec4.default.exec("npm publish", void 0, {
    cwd
  });
  return true;
};

// src/ghosts/release/index.ts
var release = async () => {
  const files = await findFile("package.json");
  if (files.length === 0) {
    return {
      status: "skipped",
      detail: "Not found package.json in repo"
    };
  }
  const result = await Promise.allSettled(files.map(npmPublish));
  if (!result.some((r) => r.status === "fulfilled" && r.value)) {
    return {
      status: "skipped",
      detail: "No package published"
    };
  }
  const json = await getPackageJson();
  const rootPackageJson = isValidPackageJson(json) ? json : null;
  const version = rootPackageJson?.version;
  if (!version) {
    return {
      status: "skipped",
      detail: "Not found version in root package.json"
    };
  }
  await import_exec5.default.exec("gh release create", [`v${version}`, "--generate-notes"]);
  return "success";
};

// src/apps.ts
var apps = {
  build,
  deploy,
  format,
  lint,
  release,
  docs,
  bump,
  merge,
  assign
};

// src/utils/getJobUrl.ts
var core8 = __toESM(require("octoflare/action/core"), 1);
var github = __toESM(require("octoflare/action/github"), 1);
var gh = github.context;
var getJobUrl = async ({
  ghost_name,
  octokit
}) => {
  const attempt_number = parseInt(core8.getInput("run_attempt"));
  const { data: jobs } = await octokit.rest.actions.listJobsForWorkflowRunAttempt({
    owner: gh.repo.owner,
    repo: gh.repo.repo,
    run_id: gh.runId,
    attempt_number
  });
  const job = jobs.jobs.find(
    ({ name }) => name.startsWith("wraith-ci") && name.includes(ghost_name)
  );
  return job?.html_url;
};

// ../shared/src/getStatusEmoji.ts
var getStatusEmoji = ({ status }) => status === "processing" ? "\u23F3" : status === "success" ? "\u2705" : status === "failure" ? "\u274C" : "\u30FC";

// src/utils/updateOutput.ts
var updateOutput = ({
  ghost_name,
  result,
  output,
  job_url
}) => {
  const alias = schema[ghost_name].alias;
  const ghost_status = typeof result === "string" ? { status: result } : result;
  const status_emoji = getStatusEmoji(ghost_status);
  const title = output.title.replace(
    new RegExp(`\\S* ${alias}`),
    `${status_emoji} ${alias}`
  );
  const name = job_url ? `[${alias}](${job_url})` : alias;
  const detail = (ghost_status.detail?.replace(/[|]/g, "") ?? "").split("\n")[0];
  const summary = output.summary.replace(
    new RegExp(`\\| ${alias} \\| .* \\| .* \\|`),
    `| ${name} | ${status_emoji} ${ghost_status.status} | ${detail} |`
  );
  return {
    title,
    summary
  };
};

// src/index.ts
var isValidOutput = (0, import_typescanner8.scanner)({
  title: import_typescanner8.string,
  summary: import_typescanner8.string
});
(0, import_action.action)(
  async ({ octokit, payload, updateCheckRun }) => {
    const name = core9.getInput("name");
    if (!(name in schema)) {
      core9.setFailed(`Invalid ghost name: ${name}`);
      return;
    }
    const ghost_name = name;
    const {
      repo,
      owner,
      check_run_id,
      data: { triggered_ghosts }
    } = payload;
    if (!triggered_ghosts.includes(ghost_name)) {
      return;
    }
    const app = apps[ghost_name];
    const result = await (0, import_attempt3.attempt)(
      () => app({
        octokit,
        payload
      }),
      (e, o) => ({
        status: "failure",
        detail: e?.message ?? String(o)
      })
    );
    if (typeof result === "object" && result.status === "failure") {
      core9.setFailed(result.detail);
    }
    if (check_run_id === void 0) {
      core9.setFailed("Missing check_run_id");
      return;
    }
    const { check, job_url } = await (0, import_unfurl.unfurl)({
      check: (0, import_attempt3.attempt)(
        () => octokit.rest.checks.get({
          repo,
          owner,
          check_run_id
        }),
        null
      ),
      job_url: (0, import_attempt3.attempt)(() => getJobUrl({ ghost_name, octokit }), "")
    });
    const output = check?.data.output;
    if (!isValidOutput(output)) {
      core9.setFailed(
        `Invalid checks output: ${JSON.stringify(output, null, 2)}`
      );
      return;
    }
    await updateCheckRun(
      updateOutput({
        output,
        ghost_name,
        result,
        job_url
      })
    );
  },
  {
    skipTokenRevocation: true
  }
);

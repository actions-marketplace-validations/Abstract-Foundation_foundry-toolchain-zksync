const core = require("@actions/core");
const toolCache = require("@actions/tool-cache");
const path = require("path");

const { restoreRPCCache } = require("./cache");
const { getDownloadObject } = require("./utils");

async function main() {
  try {
    // Get version input
    const version = core.getInput("version");

    if (version === "stable") {
      const response = await fetch(
        "https://api.github.com/repos/matter-labs/foundry-zksync/releases",
        {
          headers: {
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
          },
        }
      );
      const data = await response.json();
      version = data[0].tag_name;
    }

    // Download the archive containing the binaries
    const download = getDownloadObject(version);
    core.info(`Downloading Foundry-zksync '${version}' from: ${download.url}`);
    const pathToArchive = await toolCache.downloadTool(download.url);

    // Extract the archive onto host runner
    core.debug(`Extracting ${pathToArchive}`);
    const extract = download.url.endsWith(".zip") ? toolCache.extractZip : toolCache.extractTar;
    const pathToCLI = await extract(pathToArchive);

    // Expose the tool
    core.addPath(path.join(pathToCLI, download.binPath));

    // Get cache input
    const cache = core.getBooleanInput("cache");

    // If cache input is false, skip restoring cache
    if (!cache) {
      core.info("Cache not requested, not restoring cache");
      return;
    }

    // Restore the RPC cache
    await restoreRPCCache();
  } catch (err) {
    core.setFailed(err);
  }
}

module.exports = main;

if (require.main === module) {
  main();
}

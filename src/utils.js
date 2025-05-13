const os = require("os");

function normalizeVersionName(version) {
  const normalized = version.replace(/^nightly-[0-9a-f]{40}$/, "nightly");
  
  // Check if the normalized version is a semver and format it accordingly
  if (/^v?\d+\.\d+\.\d+$/.test(normalized)) {
    // If it's missing the 'v' prefix, add it
    const withV = normalized.startsWith("v") ? normalized : `v${normalized}`;
    // Prepend "foundry-zksync-" to the tag
    return `foundry-zksync-${withV}`;
  }
  return normalized;
}

function mapArch(arch) {
  const mappings = {
    x32: "386",
    x64: "amd64",
  };

  return mappings[arch] || arch;
}

function getDownloadObject(version) {
  const platform = os.platform();
  const normalizedVersion = normalizeVersionName(version);
  const filename = `${normalizedVersion.replace("-", "_")}_${platform}_${mapArch(os.arch())}`;
  const extension = platform === "win32" ? "zip" : "tar.gz";
  const url = `https://github.com/matter-labs/foundry-zksync/releases/download/${normalizedVersion}/${filename}.${extension}`;

  return {
    url,
    binPath: ".",
  };
}

module.exports = {
  getDownloadObject,
};

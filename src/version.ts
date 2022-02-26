/**
 * Version handling
 */

export const moonpieBotVersion = {
  major: 1,
  minor: 0,
  patch: 1,
};

export const getVersion = () =>
  `v${moonpieBotVersion.major}.${moonpieBotVersion.minor}.${moonpieBotVersion.patch}`;
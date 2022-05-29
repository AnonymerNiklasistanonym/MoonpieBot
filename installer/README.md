# Installer

## Pacman

To create `pacman` compatible packages run the following command:

```sh
# Default build from scratch - only depends on nodejs
makepkg -p PKGBUILD     --log --clean -f
# Download the prebuilt files from GitHub - no build or dependencies
makepkg -p PKGBUILD_BIN --log --clean -f
# Build from scratch using the latest git commit - only depends on nodejs
makepkg -p PKGBUILD_GIT --log --clean -f
```

You can add `--install` to instantly install the built package.

## NSIS

TODO

# Installer

## Pacman

To create `pacman` compatible packages run the following command:

```sh
# Default build from scratch - only depends on nodejs for the runtime
makepkg -p PKGBUILD     --log --clean -f --syncdeps --rmdeps
# Download the prebuilt files from GitHub - no build or dependencies
makepkg -p PKGBUILD_BIN --log --clean -f
# The same as building from scratch but use the latest commit on the main branch
makepkg -p PKGBUILD_GIT --log --clean -f --syncdeps --rmdeps
```

You can add `--install` to instantly install the built package.

Or you can run `pacman -U /package/folder/name.tar.zst`

---

To test it on Windows you can install [Arch-Linux](https://github.com/yuk7/ArchWSL) and run the following commands:

```sh
pacman -Sy archlinux-keyring && pacman -Su
pacman -S binutils git
# Create non root user to run makepkg command
useradd newuser
passwd newuser
# Change to non root user
su newuser
# Or run a command as non root user
sudo -u newuser %command%
# Create home directory for user
mkdir -p /home/newuser
chown newuser:newuser /home/newuser
usermod -d /home/newuser newuser
```

To get `sudo` access you need to do the following:

```sh
vim /etc/sudoers
```

Then uncomment the lines to allow sudo elevation:

```txt
Defaults targetpw  # Ask for the password of the target user
ALL ALL=(ALL:ALL) ALL  # WARNING: only use this together with 'Defaults targetpw'
```

In case you get an error surrounding Windows characters run:

```sh
sudo pacman -S dos2unix
dos2unix PKGBUILD
```

---

If you are on a slow machine you can skip the compression step by editing the file `/etc/makepkg.conf`:

```txt
# Uncomment the default:
#PKGEXT='.pkg.tar.zst'
# And insert the following line instead:
PKGEXT=${PKGEXT:-'.pkg.tar.zst'}
```

Now you can turn off compression by running:

```sh
PKGEXT=.tar makepkg -p PKGBUILD
```

## NSIS

To create a Windows installer install Nullsoft Scriptable Install System from their official site: http://nsis.sourceforge.net/Download
Then after installing add the install directory to your environment path so that you can use the command `makensis`.

```ps1
npm install
npm run build
npm run package:windows
cd installer
makensis windows_installer.nsi
```

## MAN page

With the following page the man page can be updated and viewed for testing.

```sh
npm run create:manPage && pandoc "installer/man.md" -s -t man -o "installer/man.1" && man -l "installer/man.1"
```

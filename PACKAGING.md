# Packaging

## RPM Packaging Prerequisites

The Fedora/RPM toolchain that electron-builder targets now requires a modern
`fpm` binary. We keep the environment deterministic with
[direnv](https://direnv.net/):

1. Install direnv and hook it into your shell (see the direnv docs for bash,
   zsh, fish, PowerShell, or the Windows Git Bash/MSYS shells).
2. Install Ruby (system packages on Linux/macOS, or via MSYS2/Homebrew on
   Windows) and add the build tools:

   ```bash
   # Fedora / RHEL
   sudo dnf install ruby ruby-devel make gcc rpm-build

   # Debian / Ubuntu / WSL
   sudo apt install ruby ruby-dev make gcc rpm

   # macOS (Homebrew)
   brew install ruby direnv
   ```

3. Install `fpm` into your user gem path so it stays reproducible:
   ```bash
   gem install --user-install fpm
   ```
4. Allow direnv to load the repository settings (one-time):
   ```bash
   direnv allow
   ```

The `.envrc` file automatically sets `USE_SYSTEM_FPM=true` and prepends the
proper gem bin directory (Linux, macOS, WSL, or Git Bash). After the shell
reloads, running `which fpm` should point to your freshly installed binary and
`npm run build:linux` will successfully emit the RPM.

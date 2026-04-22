# Building Flatpak for xDEX-UI

This repository includes configuration files and a GitHub Actions workflow to build xDEX-UI as a Flatpak package.

## Files

- `com.xdex.ui.yml` - Flatpak manifest defining the application and its dependencies
- `com.xdex.ui.desktop` - Desktop entry file for application launchers
- `com.xdex.ui.metainfo.xml` - AppStream metadata for app stores and software centers
- `.github/workflows/build-flatpak.yml` - GitHub Actions workflow that builds the Flatpak

## GitHub Actions Workflow

The workflow automatically builds a Flatpak package when:
- Code is pushed to the `master` branch
- A new tag starting with `v` is created
- A pull request targets the `master` branch
- The workflow is manually triggered

The built Flatpak is uploaded as an artifact named `Flatpak` and can be downloaded from the GitHub Actions run page.

## Building Locally

To build the Flatpak locally, you'll need:
- flatpak
- flatpak-builder

### Steps:

1. Install required Flatpak runtimes and SDK:
   ```bash
   flatpak install flathub org.freedesktop.Platform//23.08
   flatpak install flathub org.freedesktop.Sdk//23.08
   flatpak install flathub org.electronjs.Electron2.BaseApp//23.08
   flatpak install flathub org.freedesktop.Sdk.Extension.node18//23.08
   ```

2. Build the Flatpak:
   ```bash
   flatpak-builder --force-clean --user --install-deps-from=flathub build-dir com.xdex.ui.yml
   ```

3. Install the built Flatpak:
   ```bash
   flatpak-builder --user --install --force-clean build-dir com.xdex.ui.yml
   ```

4. Run the application:
   ```bash
   flatpak run com.xdex.ui
   ```

## Creating a Bundle

To create a distributable `.flatpak` bundle:

```bash
flatpak-builder --force-clean build-dir com.xdex.ui.yml
flatpak build-export export build-dir
flatpak build-bundle export xdex-ui.flatpak com.xdex.ui
```

Users can then install the bundle with:
```bash
flatpak install xdex-ui.flatpak
```

## Notes

- The Flatpak uses the Electron BaseApp to provide the Electron runtime
- The application has full filesystem access (`--filesystem=host`) to function properly as a terminal emulator
- Node.js 18 is used for building (via the org.freedesktop.Sdk.Extension.node18 extension)
- npm dependencies are resolved during the Flatpak build (network access is required while building)

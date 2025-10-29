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
- Python 3 (for generating npm sources)

### Steps:

1. Install required Flatpak runtimes and SDK:
   ```bash
   flatpak install flathub org.freedesktop.Platform//23.08
   flatpak install flathub org.freedesktop.Sdk//23.08
   flatpak install flathub org.electronjs.Electron2.BaseApp//23.08
   flatpak install flathub org.freedesktop.Sdk.Extension.node18//23.08
   ```

2. Generate npm sources for offline building:
   ```bash
   # Clone flatpak-builder-tools
   git clone https://github.com/flatpak/flatpak-builder-tools.git /tmp/flatpak-builder-tools
   cd /tmp/flatpak-builder-tools/node
   
   # Install Python dependencies
   pip3 install --user aiohttp
   
   # Generate sources for root package
   python3 -m flatpak_node_generator npm /path/to/xdex-ui/package-lock.json -o /path/to/xdex-ui/generated-sources.json
   
   # Generate sources for src package
   python3 -m flatpak_node_generator npm /path/to/xdex-ui/src/package-lock.json -o /path/to/xdex-ui/generated-sources-src.json
   
   # Merge the generated files
   cd /path/to/xdex-ui
   python3 << 'EOF'
   import json
   with open('generated-sources.json', 'r') as f1:
       data1 = json.load(f1)
   with open('generated-sources-src.json', 'r') as f2:
       data2 = json.load(f2)
   merged = data1 + data2
   with open('generated-sources.json', 'w') as out:
       json.dump(merged, out, indent=2)
   EOF
   rm generated-sources-src.json
   ```

3. Build the Flatpak:
   ```bash
   flatpak-builder --force-clean --user --install-deps-from=flathub build-dir com.xdex.ui.yml
   ```

4. Install the built Flatpak:
   ```bash
   flatpak-builder --user --install --force-clean build-dir com.xdex.ui.yml
   ```

5. Run the application:
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
- The generated-sources.json file is auto-generated and should not be committed to the repository

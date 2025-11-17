#!/bin/bash

# Configuration: Files to sync between packages/pos and packages/butler
SYNC_FILES=(
    "electron.vite.config.ts"
    "tsconfig.json"
    "tsconfig.node.json"
    "tsconfig.node.test.json"
    "tsconfig.web.json"
    "tsconfig.web.test.json"
    "vitest.config.ts"
    "src/renderer/src/main.ts"
)

POS_DIR="packages/pos"
BUTLER_DIR="packages/butler"

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Parse arguments
SYNC_PACKAGE_JSON=false
SYNC_BUILDER_CONFIG=false
while [[ $# -gt 0 ]]; do
    case $1 in
    -P | --package-json)
        SYNC_PACKAGE_JSON=true
        shift
        ;;
    -B | --build-config)
        SYNC_BUILDER_CONFIG=true
        shift
        ;;
    *)
        shift
        ;;
    esac
done

echo "Starting config sync between $POS_DIR and $BUTLER_DIR..."

for file in "${SYNC_FILES[@]}"; do
    pos_file="$POS_DIR/$file"
    butler_file="$BUTLER_DIR/$file"

    # Check if both files exist
    if [[ ! -f "$pos_file" ]] && [[ ! -f "$butler_file" ]]; then
        echo -e "${YELLOW}⚠ Skipping $file: not found in either location${NC}"
        continue
    fi

    # If only one exists, copy it to the other
    if [[ ! -f "$pos_file" ]]; then
        echo -e "${GREEN}→ Copying $file from butler to pos${NC}"
        cp "$butler_file" "$pos_file"
        continue
    fi

    if [[ ! -f "$butler_file" ]]; then
        echo -e "${GREEN}→ Copying $file from pos to butler${NC}"
        cp "$pos_file" "$butler_file"
        continue
    fi

    # Both exist - check if contents are identical first
    if cmp -s "$pos_file" "$butler_file"; then
        echo -e "✓ $file is already in sync (contents identical)"
        continue
    fi

    # Contents differ - compare modification times
    if [[ "$pos_file" -nt "$butler_file" ]]; then
        echo -e "${GREEN}→ Syncing $file: pos → butler (newer)${NC}"
        cp "$pos_file" "$butler_file"
    elif [[ "$butler_file" -nt "$pos_file" ]]; then
        echo -e "${GREEN}→ Syncing $file: butler → pos (newer)${NC}"
        cp "$butler_file" "$pos_file"
    else
        echo -e "${YELLOW}⚠ $file: same timestamp but different contents, skipping${NC}"
    fi
done

# Sync package.json - only specific keys (only if flag is set)
if [[ "$SYNC_PACKAGE_JSON" == true ]]; then
    echo "Syncing package.json keys (dependencies, devDependencies, scripts, author)..."

    pos_package="$POS_DIR/package.json"
    butler_package="$BUTLER_DIR/package.json"

    if [[ -f "$pos_package" ]] && [[ -f "$butler_package" ]]; then
        # Determine which is newer
        if [[ "$pos_package" -nt "$butler_package" ]]; then
            echo -e "${GREEN}→ Syncing package.json keys: pos → butler${NC}"
            source_package="$pos_package"
            target_package="$butler_package"
        elif [[ "$butler_package" -nt "$pos_package" ]]; then
            echo -e "${GREEN}→ Syncing package.json keys: butler → pos${NC}"
            source_package="$butler_package"
            target_package="$pos_package"
        else
            echo -e "✓ package.json files have same timestamp, skipping"
            source_package=""
        fi

        # Perform the sync if there's a source
        if [[ -n "$source_package" ]]; then
            # Extract keys from source and merge into target
            jq -s '.[0] * {dependencies: .[1].dependencies, devDependencies: .[1].devDependencies, scripts: .[1].scripts, author: .[1].author}' \
                "$target_package" "$source_package" >"$target_package.tmp" &&
                mv "$target_package.tmp" "$target_package"
            echo -e "${GREEN}✓ Merged selected keys into $(basename $(dirname $target_package))${NC}"
        fi
    else
        echo -e "${YELLOW}⚠ Skipping package.json: one or both files not found${NC}"
    fi
fi

# Sync electron-builder.yml - exclude specific keys (only if flag is set)
if [[ "$SYNC_BUILDER_CONFIG" == true ]]; then
    echo "Syncing electron-builder.yml (excluding appId, productName, etc.)..."

    pos_builder="$POS_DIR/electron-builder.yml"
    butler_builder="$BUTLER_DIR/electron-builder.yml"

    if [[ -f "$pos_builder" ]] && [[ -f "$butler_builder" ]]; then
        # Determine which is newer
        if [[ "$pos_builder" -nt "$butler_builder" ]]; then
            echo -e "${GREEN}→ Syncing electron-builder.yml: pos → butler${NC}"
            source_builder="$pos_builder"
            target_builder="$butler_builder"
        elif [[ "$butler_builder" -nt "$pos_builder" ]]; then
            echo -e "${GREEN}→ Syncing electron-builder.yml: butler → pos${NC}"
            source_builder="$butler_builder"
            target_builder="$pos_builder"
        else
            echo -e "✓ electron-builder.yml files have same timestamp, skipping"
            source_builder=""
        fi

        # Perform the sync if there's a source
        if [[ -n "$source_builder" ]]; then
            # Preserve specific keys from target, merge rest from source
            yq eval-all '
                (select(fileIndex == 0) | {
                    "appId": .appId,
                    "productName": .productName,
                    "name": .name,
                    "win": {"executableName": .win.executableName}
                }) as $preserved |
                select(fileIndex == 1) |
                .appId = $preserved.appId |
                .productName = $preserved.productName |
                .name = $preserved.name |
                .win.executableName = $preserved.win.executableName
            ' "$target_builder" "$source_builder" >"$target_builder.tmp" &&
                mv "$target_builder.tmp" "$target_builder"
            echo -e "${GREEN}✓ Merged electron-builder.yml into $(basename $(dirname $target_builder))${NC}"
        fi
    else
        echo -e "${YELLOW}⚠ Skipping electron-builder.yml: one or both files not found${NC}"
    fi
fi

echo -e "${GREEN}Sync complete!${NC}"

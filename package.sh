#!/bin/bash

MANIFEST="firefox/manifest.json"

if [[ ! -f "$MANIFEST" ]]; then
  echo "Error: $MANIFEST not found."
  exit 1
fi

VERSION=$(grep '"version"' "$MANIFEST" | head -1 | sed -E 's/.*"version": *"([^"]+)".*/\1/')

if [[ -z "$VERSION" ]]; then
  echo "Error: Could not extract version."
  exit 1
fi

ZIP_NAME="iwa-eligibility-checker-v$VERSION.zip"

(cd firefox && zip -r "../$ZIP_NAME" .)

echo "Created $ZIP_NAME"

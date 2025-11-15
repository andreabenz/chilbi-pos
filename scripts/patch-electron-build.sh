#!/usr/bin/env bash

PATCHDIR="$(dirname "$0")/patches"

patch -p0 <"$PATCHDIR/fix-rpm-build-linux.patch"

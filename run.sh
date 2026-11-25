#!/usr/bin/env bash
set -euo pipefail
mkdir -p out
find src -name "*.java" > sources.txt
javac -cp "lib/h2-2.2.224.jar" -d out @sources.txt
rm -f sources.txt
java -cp "out:lib/h2-2.2.224.jar" com.lifelink.Main

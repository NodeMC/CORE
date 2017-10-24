#!/usr/bin/env sh
#
# (c) 2017 NodeMC
#

echo "running as '$(whoami)'"
echo "running in '$(pwd)'"

# This allows us to use image built node_modules, no yarn needed!
mkdir -p node_modules

echo "shadow mounting '/node_modules/*' -> $(pwd)/node_modules/*"
for f in /node_modules/*; do
  ln -sv "$f" "$(pwd)$f";
done

#ln -sv /node_modules $(pwd)/node_modules

yarn start

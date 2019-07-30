#!/bin/sh

set -ex

cd ~
rm -rf ~/.dotfiles
git clone git@github.com:zzh8829/dotfiles .dotfiles
cd .dotfiles
./dotfiles.sh
#!/bin/sh

if [ ! -n "$1" ];then
	echo "Usage: $0 LANG"
	echo "LANG is Minecraft lang in lowercase (like en_gb)"
	exit 1
fi

LANG_SUF=$(echo $1 | cut -d '_' -f 2 | tr -s '[:lower:]' '[:upper:]')

[ -n "$LANG_SUF" ] && LANG_SUF=_$LANG_SUF

#https://s3.amazonaws.com/Minecraft.Download/indexes/1.13.json
#https://launchermeta.mojang.com/v1/packages/280eebe96a3ca45fcbc85800552cea775bc5f73c/1.14.json
#https://launchermeta.mojang.com/v1/packages/28c11387f2c576240a31d359991bbaed28db57ab/1.15.json
#https://launchermeta.mojang.com/v1/packages/1e185d112e2ee017330fb83700b5eaa93fb5cdfd/1.16.json

HASH=$(wget https://launchermeta.mojang.com/v1/packages/e5af543d9b3ce1c063a97842c38e50e29f961f00/1.17.json -O - | jq -r ".objects.\"minecraft/lang/$1.json\".hash")

mkdir -p lang

wget http://resources.download.minecraft.net/$(echo $HASH | head -c 2)/$HASH -O - | jq -r 'to_entries|map("\(.key)=\(.value)")[]' > lang/$(echo $1 | cut -d '_' -f 1)$LANG_SUF.lang

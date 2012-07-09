#!/bin/sh
mv "$2" "$2".old
ogr2ogr -f geoJSON -t_srs EPSG:4326 "$2" "$1"

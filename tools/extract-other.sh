#!/bin/sh
prefix="2,4,6,7,9,11,14"
name=18
result=20
step=6

header=$(head -n 1 "$1" | csvtool col "$prefix" -)
candidats=$(csvtool col $(seq -s , $name $step 100) "$1"|sed -n 2p|csvtool trim r -)
echo "$header,$candidats"
tail -n +2 "$1" | csvtool col "$prefix,$(seq -s , $result $step 100)" - | csvtool trim r -

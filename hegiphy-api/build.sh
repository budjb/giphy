#!/bin/bash

PROJECT_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

set -e

rm -rf $PROJECT_ROOT/build $PROJECT_ROOT/dist

cp -R $PROJECT_ROOT/src $PROJECT_ROOT/build
rm -f $PROJECT_ROOT/build/requirements.txt
find $PROJECT_ROOT -name *.pyc -exec rm -f {} \;

pip install -r src/requirements.txt --target $PROJECT_ROOT/build

mkdir -p $PROJECT_ROOT/dist
pushd $PROJECT_ROOT/build
zip -r9 $PROJECT_ROOT/dist/lambda.zip .
popd

rm -rf $PROJECT_ROOT/build

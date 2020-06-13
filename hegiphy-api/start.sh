#!/bin/bash

PROJECT_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

if [[ ! -d "$PROJECT_ROOT/.tox/py36" ]]; then
    echo "Please run tox first"
    exit 1
fi

( cd src && ../.tox/py36/bin/python server.py )


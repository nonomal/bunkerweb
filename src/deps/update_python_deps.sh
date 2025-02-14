#!/bin/bash
# Remember to run this script in a docker container with 3.9 python version

echo "Updating python dependencies"

echo "Creating virtual environment"

# shellcheck disable=SC1091
python3 -m venv tmp_venv && source tmp_venv/bin/activate
pip install --force-reinstall --no-cache-dir --require-hashes -r requirements-deps.txt

function update_python_deps() {
    file=$1

    echo "Updating $file"
    cd "$(dirname "$file")" || return

    if [[ $file == *.in ]]; then
        mv "$(basename "$file")" "$(basename "${file/%.in}.txt")"
    fi

    echo "all" | pip-upgrade "$(basename "${file/%.in}.txt")"

    if [[ $file == *.in ]]; then
        mv "$(basename "${file/%.in}.txt")" "$(basename "$file")"
        echo "Generating hashes for $file ..."
        pip-compile --generate-hashes --allow-unsafe --resolver=backtracking --strip-extras "$(basename "$file")"
    else
        echo "No need to generate hashes for $file"
    fi

    echo " "

    cd - || return
}

update_python_deps requirements-deps.in

pip install --no-cache-dir --require-hashes -r requirements-deps.txt

echo "Updating python requirements files"

files=("requirements.in" "../autoconf/requirements.in" "../scheduler/requirements.in" "../ui/requirements.in")

shopt -s globstar
for file in ../{common,../{docs,misc}}/**/requirements*.in
do
    if echo "$file" | grep "ansible"; then
        continue
    fi
    files+=("$file")
done
shopt -u globstar

for file in "${files[@]}"
do
    update_python_deps "$file"
done

echo "Finished updating python requirements files, cleaning up ..."

deactivate
rm -rf tmp_venv

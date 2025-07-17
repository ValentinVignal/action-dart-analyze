#!/bin/bash

# Default values
FAIL_ON="error"
WORKING_DIRECTORY="./"
TOKEN=""
CHECK_RENAMED_FILES=false
EMOJIS=true
FORMAT=true
LINE_LENGTH=null

# Usage function
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "-t, --token <token>              Required authentication token."
    echo ""
    echo "    --fail-on <value>            Set failure level (nothing, format, info, warning, error). Default: warning."
    echo "    --working-directory <path>   Set the working directory. Default: ./"
    echo "    --[no-]check-renamed-files   Enable or disable checking renamed files. Default: false."
    echo "    --[no-]emojis                Enable or disable emojis. Default: true."
    echo "    --[no-]format                Enable or disable formatting. Default: true."
    echo "    --line-length <number>       Set max line length. Default: null."
    echo "-h, --help                       Show this help message."
    exit 0
}

# Function to extract argument value (supports --option=value and --option value)
get_arg_value() {
    if [[ "$1" == *=* ]]; then
        echo "${1#*=}"  # Extract value after '='
    else
        echo "$2"       # Use the next argument
    fi
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case "$1" in
        --fail-on=*)
            FAIL_ON=$(get_arg_value "$1")
            ;;
        --fail-on)
            FAIL_ON=$(get_arg_value "$1" "$2")
            shift
            ;;
        --working-directory=*)
            WORKING_DIRECTORY=$(get_arg_value "$1")
            ;;
        --working-directory)
            WORKING_DIRECTORY=$(get_arg_value "$1" "$2")
            shift
            ;;
        --token=*|-t=*)
            TOKEN=$(get_arg_value "$1")
            ;;
        --token|-t)
            TOKEN=$(get_arg_value "$1" "$2")
            shift
            ;;
        --check-renamed-files)
            CHECK_RENAMED_FILES=true
            ;;
        --no-check-renamed-files)
            CHECK_RENAMED_FILES=false
            ;;
        --emojis)
            EMOJIS=true
            ;;
        --no-emojis)
            EMOJIS=false
            ;;
        --format)
            FORMAT=true
            ;;
        --no-format)
            FORMAT=false
            ;;
        --line-length=*)
            LINE_LENGTH=$(get_arg_value "$1")
            ;;
        --line-length)
            LINE_LENGTH=$(get_arg_value "$1" "$2")
            shift
            ;;
        --help|-h)
            usage
            ;;
        *)
            echo "Unknown option: $1"
            usage
            ;;
    esac
    shift
done

# Ensure required parameters are set
if [[ -z "$TOKEN" ]]; then
    echo "Error: --token is required."
    exit 1
fi


curl https://raw.githubusercontent.com/ValentinVignal/action-dart-analyze/refs/heads/main/dist/index.js -o index.js


# Run the Node.js script with environment variables
INPUT_FAIL_ON="$FAIL_ON"
INPUT_WORKING_DIRECTORY="$WORKING_DIRECTORY" \
INPUT_TOKEN="$TOKEN" \
INPUT_CHECK_RENAMED_FILES="$CHECK_RENAMED_FILES" \
INPUT_EMOJIS="$EMOJIS" \
INPUT_FORMAT="$FORMAT" \
INPUT_LINE_LENGTH="$LINE_LENGTH" \
node index.js
#!/bin/bash

# Array of fruit data
declare -a fruits=(
  '{"name":"Apple","color":"red","price":1.99}'
  '{"name":"Banana","color":"yellow","price":0.99}'
  '{"name":"Orange","color":"orange","price":1.49}'
  '{"name":"Grape","color":"purple","price":2.99}'
  '{"name":"Kiwi","color":"brown","price":1.79}'
)

# URL of the API
API_URL="http://host.docker.internal:3002/fruits"

# Loop through the fruits array and send POST requests
for fruit in "${fruits[@]}"
do
  echo "Creating fruit: $fruit"
  curl -X POST \
    -H "Content-Type: application/json" \
    -d "$fruit" \
    $API_URL
  echo -e "\n"
done

# Get all fruits to verify
echo "Getting all fruits:"
curl $API_URL

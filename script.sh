#!/bin/bash

# Initialize the counter
tip=$(curl https://blockstream.info/liquid/api/blocks/tip/height)
echo "tip: $tip"

# For loop that iterates 10 times
for ((i=0; i<1008; i++)); do
    curl "https://blockstream.info/liquid/api/blocks/${tip}" | tee "$tip.json"
    tip=$((tip - 10))
    sleep 1
done

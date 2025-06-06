#!/bin/zsh

# Get current time in milliseconds (compatible with macOS)
t=$(($(date +%s)*1000 + $(date +%N | cut -c1-3)))

# Send request using httpie
http POST http://localhost:3000/event \
  type="withdraw" \
  amount="42.15" \
  user_id:=1 \
  t:="$t"

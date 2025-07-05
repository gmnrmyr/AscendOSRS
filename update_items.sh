#!/bin/bash

# Log file for updates
LOG_FILE="item_updates.log"

# Function to log messages with timestamp
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Create backup of current items
if [ -f "public/osrs_items.json" ]; then
    cp "public/osrs_items.json" "public/osrs_items.backup.json"
    log_message "Created backup of current items"
fi

# Run the update script
log_message "Starting items update..."
node osrs_wiki_full_item_dump.js

# Check if update was successful
if [ $? -eq 0 ]; then
    log_message "Items updated successfully"
    # Remove backup if update was successful
    rm -f "public/osrs_items.backup.json"
else
    log_message "Update failed! Restoring backup..."
    # Restore backup if update failed
    if [ -f "public/osrs_items.backup.json" ]; then
        mv "public/osrs_items.backup.json" "public/osrs_items.json"
        log_message "Backup restored"
    fi
fi 
@echo off
echo Starting OSRS items update at %date% %time%

cd /d "%~dp0"

:: Create log file with timestamp
set logfile=item_updates_%date:~-4,4%%date:~-10,2%%date:~-7,2%.log
echo Update started at %time% > %logfile%

:: Create backup of current items
if exist "public\osrs_items.json" (
    copy "public\osrs_items.json" "public\osrs_items.backup.json"
    echo Created backup of current items >> %logfile%
)

:: Run the update script
echo Running update script... >> %logfile%
node osrs_wiki_full_item_dump.js >> %logfile% 2>&1

:: Check if update was successful
if %errorlevel% equ 0 (
    echo Update completed successfully at %time% >> %logfile%
    if exist "public\osrs_items.backup.json" del "public\osrs_items.backup.json"
) else (
    echo Update failed! >> %logfile%
    if exist "public\osrs_items.backup.json" (
        copy "public\osrs_items.backup.json" "public\osrs_items.json"
        echo Restored backup >> %logfile%
    )
)

echo Update process finished at %time% >> %logfile% 
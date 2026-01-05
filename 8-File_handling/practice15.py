# 3. Ask user for a filename and copy it to a backup folder.

import shutil
import os

filename = input("Enter the file name:")

backup_folder = "backup"

if not os.path.exists(backup_folder):
    os.mkdir(backup_folder)

try:
    shutil.copy(filename, backup_folder)
    print("Files copied successfgully to backup folder.")
except FileNotFoundError:
    print("File not found. pLease check up the filename.")          
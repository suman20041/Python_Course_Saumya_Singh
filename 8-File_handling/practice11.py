# 1. Use with to read the entire content of info.txt.

with open("info.txt", "r") as f:
    data = f.read()
    print(data)
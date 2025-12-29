# 1. Read a file named story.txt and print the full content.

with open("story.txt", "r") as s:
    data = s.read()
    print("Data is: ", data)


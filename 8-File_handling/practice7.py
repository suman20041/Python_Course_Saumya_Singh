# 3. Print how many lines are present in notes.txt.

with open("notes.txt", "r") as f:
    listOfLines = f.readlines()
    print("Output of readLines Function", listOfLines)
    print("Number of Lines in File", len(listOfLines))
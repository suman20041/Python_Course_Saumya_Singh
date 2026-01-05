# 1. Write your name and class into a file named intro.txt.

with open("intro.txt", "w") as f:
    file = f.write("My name is Suman panda \nI completed my btech")
    print(file)
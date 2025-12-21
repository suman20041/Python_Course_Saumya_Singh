# Write a program using nested loops to print this pattern:
# *
# * *
# * * *

for i in range(1, 4):
    for j in range(i):
        print("*", end=" ")
    print()    
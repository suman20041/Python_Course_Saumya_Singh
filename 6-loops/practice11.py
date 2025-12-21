# 11.Write a program that prints the multiplication table of any number entered by the user using a for loop.
n = int(input("Enter a number:"))
for i in range(1, 11, 1):
    print(f"{n} X {i} = {n*i}")
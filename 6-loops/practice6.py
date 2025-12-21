# 6. Saumya wants to print her name 5 times, but each time with a number in
# front of it. Write a program using a while loop that prints:
# 1. Saumya Singh
# 2. Saumya Singh
# 3. Saumya Singh
# 4. Saumya Singh
# 5. Saumya Singh
n = 1
name = "Saumya Singh"

while n<=5:
    print(f"{n}. {name}")
    n = n + 1
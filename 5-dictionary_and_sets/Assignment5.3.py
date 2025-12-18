# Try to add both integer 9 and float 9.0 to a set and observe what happens.
# (Hint: You can convert one into a string to make both unique.)

num = set()
# num.add(9)
num.add("9")
num.add(9.0)
print(num)
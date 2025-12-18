# Methods in List

#Lists are mutable
marks = [99, 100, 90, 95]
print(marks)

# marks[1] = 98
# print(marks)

# Slicing
print(marks[1:3])
print(max(marks))
print(min(marks))
marks.append(92)
print(marks)
marks.sort()
print(marks)
marks.pop(1)
print(marks)
marks.remove(100)
print(marks)
marks.insert(1,100)
print(marks)

# # STRINGS ARE IMMUTABLE
# name = "Suman"
# name[1] = "a"
# print(name)
# You are given a list of programming languages:
# ["Python", "Java", "C++", "Python", "Java", "C"]
# Convert it into a set and print how many unique languages Divya knows.

programmingList = ["Python", "Java", "C++", "Python", "Java", "C"]
print(type(programmingList))

# how to convert a list into set

programmingSet = set(programmingList) # Inside set method if we pass list then it make set
print(type(programmingSet))
print(programmingSet)
print("Divya knows these many languages",len(programmingSet))
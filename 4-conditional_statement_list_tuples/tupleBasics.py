# tuple Basics

myTuple = (34,78,99)
studentTuple = ("Suman", "Baisakhi", "Jharana", "Baisakhi")

# studentTuple[1] = "Kiran" #Tuples are immuatable/not changable

print(studentTuple[2])

#empty Tuples (interview question)
emptyTuple = ()
singleTuple = (1,)  # if in your tuple have single value then always prefer to use commas otherwise type is int not tuple
print(type(emptyTuple))
print(type(studentTuple))
print(type(singleTuple))
print(studentTuple.index("Baisakhi"))
print(studentTuple.count("Runu"))
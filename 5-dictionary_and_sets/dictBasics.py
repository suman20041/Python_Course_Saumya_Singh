# Dictionary Basics

student = {
    "name": "Suman Panda",
    "city": "Aska",
    "age": 21,
    "rollNumber": 110
    #"name":"Jharana" #if we create same keys with multiple times then the last occurance of the key and it's associated value will overwrite any previous occurance
}

# students = {
#     "country" : "India"
# }

print(type(student))
print(student["name"])
print(student)
print(student["city"])
# student["city"] = "Hyderbad"
# print(student)
student["favSubject"] = "Maths"
print(student)
student.pop("favSubject")
print(student)
print(student.keys())
print(student.values())
print(student.items())

# update method
# student.update(students)
# print(student)

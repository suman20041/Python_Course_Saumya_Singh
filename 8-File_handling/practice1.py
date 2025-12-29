# 1. Write code to open a file named mydata.txt in read mode.

file = open("mydata.txt", "r")
data = file.read()
print("File in read mode is: ",data)
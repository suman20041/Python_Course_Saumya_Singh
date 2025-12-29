# 3. What happens if you open a non-existing file in "r" mode?

file = open ("abc.txt", "r")
data = file.read()
print("Data of file: ", data) # error -->  No such file or directory: 'abc.txt'
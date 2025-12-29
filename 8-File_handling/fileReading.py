# file = open("report.txt", "r")
# data = file.read()
# print("File Data: ", data)
# file.close()

# Important to close a file
# not consume space in memory... any other person come do changes of you file  that is the quality of responsible programmer.


# with keyword

# with open("report.txt", "r") as f:
    # data = f.read()
    # print("File Data: ", data)

with open("newTextFile.txt", "r") as f:
    # line1 = f.readline()  # readline method sequentially goes line by line... when all line read then print empty.
    # line2 = f.readline()
    # line3 = f.readline()
    # line4 = f.readline()
    # line5 = f.readline() # when come to last line then point to the empty line
    # line6 = f.readline()
    # data = f.read() # not able to read the whole file content because we already read the readline 5 times
    # print("Line 1", line1)
    # print("Line 2", line2)
    # print("Line 3", line3)
    # print("Line 4", line4)
    # print("Line 5", line5)
    # print("Line 6", line6)
    # print("File Data", data)

    readLinesMethod = f.readlines() # readlines method used with file object and read all the lines from the opened file and return them as a list of strings.
    print(readLinesMethod)  


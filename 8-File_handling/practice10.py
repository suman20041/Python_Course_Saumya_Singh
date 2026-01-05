# 3. Append "Completed" to an existing file status.txt.

with open("status.txt", "a") as f:
    data = f.write(" Completed")
    print(data)
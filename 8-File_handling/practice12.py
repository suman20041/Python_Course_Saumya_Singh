# 2. Use with to write "Hello World" in hello.txt.

with open("hello.txt", "w") as f:
    data = f.write('Hello World')
    print(data)
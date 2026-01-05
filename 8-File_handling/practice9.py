# 2. Create a file goals.txt and write 3 goals for this month.

with open("goals.txt", "w") as f:
    file = f.write("Complete python lecture of Saumya dii youtube channel \nTry to get more score in open source contribution \nReady to face new challanges in 2026")
    print(file)
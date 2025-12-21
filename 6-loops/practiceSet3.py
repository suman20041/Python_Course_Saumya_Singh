# 3. Print all numbers between 1 and 50 except multiples of 5.

for i in range (1, 51):
    if(i % 5 != 0):
        print(i)
    elif(i % 5 == 0):
        continue
    i = i + 1
# Write a program to print numbers from 1 to 50, but print "Saumya Singh"
# instead of numbers that are multiples of 5.
# Example Output: 1 2 3 4 Saumya Singh 6 7 8 9 Saumya Singh ...

for i in range (1,51):
    if(i % 5 != 0):
        print(i)
    elif(i % 5 == 0):
        print("Suman Panda")    
    i = i + 1
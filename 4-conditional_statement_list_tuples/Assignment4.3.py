# Write a program to check grade based on marks (A/B/C/D) using if-elif-else.

marks = int(input("Enter your marks: "))

if(marks >= 90):
    print("Your grade is A")
elif(marks >= 80):
    print("Your grade is B")
elif(marks >= 70):
    print("Your grade is C")
else:
    print("Your grade is D")
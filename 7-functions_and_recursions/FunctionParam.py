
#function Definition with Parameter
def average(a=10,b=20):
    averageValue = ( a+b)/2
    print(averageValue)


# Function Calling with Arguments
average(5, 10)
average(7, 10)
average(80, 98)
average()



# 1. Write a function show_age(name, age) that prints: "Saumya Singh is 21 years old."

def show_age(name= "Saumya Singh", age=25):
    print(f"{name} is {age} years old")

show_age("Saumya Singh", 25)  
show_age()
show_age("Suman", 21)



# 2. Create a function add_numbers(a, b) that prints both the sum and difference.

def add_numbers(a, b):
    print("Sum = ", a + b)
    print("Difference = ", a - b)

add_numbers(15, 2)



# 3. Write a function fav_food(food) that prints "Saumya loves <food>".

def fav_food(food):
    print(f"Saumya loves {food}")

fav_food("Waffles")   
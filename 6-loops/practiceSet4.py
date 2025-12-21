# 4. Create a program that asks the user for 5 favorite foods and prints them one by one.

foods = []

for i in range(1,6):
    food = input("Enter you favorite food: ")
    foods.append(food)

print("\n You favorite foods are: ")
for foodss in foods:
    print(foodss)



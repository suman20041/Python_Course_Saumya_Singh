# 2️⃣Bill Split Calculator
# Write a program that takes total bill amount and number of friends as input.
# Calculate how much each person will pay.

# Also print the data type of each variable used.
# (Hint: use float() and division operator)
# Total bill: 1000
# Friends: 4
# Each will pay: 250.0

bill_amount = float(input("Total bill: "))
friends = float(input("Friends: "))
Each_Person = bill_amount/friends
print("Each will pay: ",Each_Person)
print("Data Type of bill_amount: ", type(bill_amount))
print("Data Type of friends: ", type(friends))
print("Data Type of Each_Person: ", type(Each_Person))

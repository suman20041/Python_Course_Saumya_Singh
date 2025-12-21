# Mini Project – Guess the Number Game
# Concepts Used: while loop and user input.
# Sample Run:
# Guess a number between 1 and 10: 4
# Wrong guess! Try again.
# Guess again: 7
# Congratulations, Saumya! You guessed it right 🎉

import random

userEnter = int(input("Guess a number between 1 and 10: "))

computer = random.randint(1,10)

while userEnter != computer:
    print("Wrong guess! Try again")
    userEnter = int(input("Guess again: "))

print("Congratulations, Suman! You guessed it right 🎉")
    


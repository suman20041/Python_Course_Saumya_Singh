# 2. Write a function that takes a string and returns the count of vowels and consonants separately.

# We also return two value inside the function
#  if any function return two value then at the time of calling we store in 2 variable

def countVowConso(userInput):

    #define vowels
    vowels = "aeiouAEIOU"

    countVowel = 0
    countConsonants= 0

    # SUMAN123
    for eachChar in userInput:
        if(eachChar.isalpha()):
            if(eachChar in vowels):
                countVowel = countVowel + 1
            else:
                countConsonants += 1  
    return countVowel, countConsonants  

# Function Call

vowels, consonants = countVowConso("Suman Panda") 

print(vowels, consonants)
print(vowels)

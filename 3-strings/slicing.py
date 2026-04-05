# understanding slicing concept

str = "GulabJamun"

firstHalf = str[0:5] #Gulab
trialFirstHalf = str[ :5] #Gulab

print(firstHalf)
print(trialFirstHalf)

secondHalf = str[5:10] #Jamun
trailSecondHalf = str[5: ] #Jamun

print(secondHalf)
print(trailSecondHalf)

# Negative Indexing

print(str[-5:-1])
print(str[-5:])
print(str[:-1])
print(str[:])
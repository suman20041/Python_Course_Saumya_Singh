# 1. Write a program with a local variable score inside a function and a global one outside.

score = 50

def loc_var():
    score = 60
    print("Local Variable: ", score)

loc_var()
print("Global Variable: ",score)




# 2. Create a program using global keyword to modify a variable from inside a function.

num = 5

def modify():
    global num
    num = 10

print("Outside function: ",num)  
modify()  
print("Inside function: ",num)



# 3. Explain the difference between local and global scope in your own words.

# Local scope: Defined inside of a function and only accessible within it.

# Global Scope: Defined outside of any function and accessible both inside and outside of the function



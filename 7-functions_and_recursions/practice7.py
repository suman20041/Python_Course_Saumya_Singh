# 1. Define a function message(text="Keep Learning!") and call it with and without an argument.

def message(text="Keep Learning!"):
    return text

print(message("Keep Growing!"))
print(message())

# 2. Create a function login(username, password="1234") that prints the credentials.

def login(username, password="1234"):
    print("Username: ",username)
    print("Password: ",password)

login("Suman")    
login("Baisakhi", "baisakhi123")


# Sometimes file exist or may be not...if file not exist then our program crash so avoid crash(means avoid error) our program we use try catch block

try:
    with open("hungry.txt", "r") as f:
        listOfLines = f.readlines()
        print("Output of readLines Function", listOfLines)
        print("Number of Lines in File", len(listOfLines))
except FileNotFoundError:
    print("That files does not exist")      

# without using try and catch block if file not exist
# with open("hungry.txt", "r") as f:
#         listOfLines = f.readlines()
#         print("Output of readLines Function", listOfLines)
#         print("Number of Lines in File", len(listOfLines))      
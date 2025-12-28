# Rule Based AI Python ChatBot

import datetime
import time

name = input("Swagat h, enter your name : ")
presentHours = datetime.datetime.now().hour
       

if 5 <= presentHours <= 11: # <= --> grater than and <= ---> less than
    print("Good morning, ", name)
elif 11 <= presentHours <= 17:
    print("Good afternoon, ", name)
elif 17 <= presentHours <= 20:
    print("Good evening, ", name)
else:
    print("Good night, ", name)     




print("Namaste! Welcome to Your ChatBot")
print("You can ask me basic question, Type 'bye' to exit from the bot")

# Chatbot Memory Creation [ dictionary of responses ]

responses = {
    "hello": "Hi, welcome. How can I help you?",
    "how are you": "I am very fine. Thank you",
    "who are you": "I am smart AI chatbot",
    "motivate me": "Keep going. Every bug of your project makes you a better developer",
    "happy": "Great to hear that",
    "function kya hote hai": "jakar chapter 7 padho",
    "smile" : "problem solving makes you a better developer",
    "dream" : "travel all over the world",
    "professional" : "software developer"
}

# Method/Function to get response of ChatBot

def getResponseOfBot(userQuestion):
    userQuestion = userQuestion.lower()
    for eachKey in responses:
        if eachKey in userQuestion:
            return responses[eachKey]
        elif "sad" in userQuestion:
            return "my program not working"

    return "I am not able to tell that yet. Mai jaldi hi ye sikh lunga"


# Take user input
while True:
    userInput = input("Please ask your questions: ")
    time.sleep(1)
    reply = getResponseOfBot(userInput)
    print("Bot Response : ", reply)

    if "bye" in userInput.lower():
        break
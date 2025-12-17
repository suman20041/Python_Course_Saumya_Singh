# Convert text-based emotions into emojis

msg = input("Enter you message: ")

msg = msg.replace(":)", " 🙂 ")
msg = msg.replace(":D", " 😀 ")
msg = msg.replace(":-)", " 😊 ")
msg = msg.replace("^_^", " 😉 ")
msg = msg.replace(":(", " ☹️ ")

print(msg)

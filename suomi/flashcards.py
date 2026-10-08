#TODO check similarity of tries
#target primary / word types / course
#better stats

import pandas as pd

# flashcards.py N primaryonly courses types 
#     defaults: 50 True "all" "all"

df = pd.read_json("suomi/vocab.json",encoding='utf-8').T.sample(frac=1).reset_index(drop=True)
attempts = []
success = []

for row in df.itertuples():
    qword = row.en.split(';')[0] # type: ignore . question word
    awords = row.fi.split(';') # type: ignore . answer words

    print()
    a = 0

    while True:
        answer = input(f"What is \"{qword}\"? ").strip().lower()
        a +=1

        if answer not in awords:
            #check similarity?
            yn = input("Incorrect. Try again y/n? ").strip().lower()
            if yn!='y': 
                success.append(False)
                print(f"The correct word was {awords[0]}")
                break
        else: 
            success.append(True)
            break
    attempts.append(a)

print()
print("Congradulations you win finnish!!!!")
print(attempts)
print(success)
#TODO check similarity of tries
#target primary / word types / course
#better stats

import pandas as pd

# flashcards.py N primaryonly langratio courses types subject
#     defaults: 50 True       1         "all"   "all" "all"
# langratio: 1=en-to-fi, 0=fi-to-en

#run
def rungame(df):
    attempts = []
    success = []
    hints = []
    tolang = "fi"

    for row in df.itertuples():
        a = 0 # attempts counter per word
        h = 0 #hints counter per word
        qword = row.en.split(';')[0] # type: ignore . question word
        awords = row.fi.split(';') # type: ignore . answer words
        questiontext = f"What is \"{qword}\"? "
    
        while True:
            answer = input(questiontext).strip().lower()
            match answer:
                case "-skip":
                    print(f"The correct word was {awords[0]}")
                    success.append(False)
                    break
                case "-hint" | "-help":
                    if h==0 and (not pd.isnull(row.subject_category)) and tolang=="fi": 
                        h += 1
                        print("Hint: category is ", row.subject_category)
                    elif h < len(awords[0]):
                        h +=1
                        print(f"Hint: first {h} letter(s): {awords[0][:h]}")
                    else:
                        print("no more hint")
                case "-end":
                    print(f"The correct word was {awords[0]}")
                    success.append(False)
                    attempts.append(a)
                    hints.append(h)
                    return success,attempts,hints
                case _ :
                    a +=1
    
                    if answer not in awords: #check similarity? äa,öo?
                        questiontext = f"Incorrect. What is \"{qword}\"? "
                    else: 
                        success.append(True)
                        break
        hints.append(h)
        attempts.append(a)
        print()
    return success,attempts,hints


df = pd.read_json("suomi/vocab.json",encoding='utf-8').T.sample(frac=1).reset_index(drop=True)

# TODO arguments: filter df

success,attempts,hints = rungame(df)
print()
print("Congradulations you win finnish!!!!")
print("attempts ",attempts)
print("successes ",success)
print("hints ",hints)
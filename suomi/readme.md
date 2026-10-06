# Welcome to my twisted mind game

 - flashcards.py is the main program. Use control+C to stop playing partway through.
 - vocab.json is the main storage
 - vocab.csv exists for convenience, its easier for humans to write in it than the json
 - cleandata.py takes the csv, does a little processing, and loads it to the json and csv again.

### vocab.csv - edit data
Use this to edit the data. in 'fi' and 'en' columns, if ';' is used as a delimiter, then both sides will be accepted as a valid answer, e.g. if 'apua;blue123' is written in the fi column, then 'blue123' will be accepted as an answer. When the program asks a question, it will always use the first word in the list, e.g. it will not ask 'what is blue123 in english?'. Format: everything is changed to lowercase, ending spaces are removed by cleandata.py. For verbs, write in infinitive, "basic" form, i.e. "puhua" and (to) "speak". Punctuation is not written, with the exception of ' (I'm), though the version without the comma is accepted for answers (i'm;im).

Course refers to Finnish 1, Finnish 2, etc. 

Type: substantiivi (noun), verbi, adjektiivi, etc, phrase, "idk" (the small words like or,and,else,this. or i dont know), fragment (suffix or prefix meaning something esim epä-, -iton)

Primary: Arbitrary, but generally if the word was said more than once in class, primary, if it appears in an example once, then its secondary. Null values are assumed primary.

Verb type: null for nonverbs, integer value.
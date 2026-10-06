#sort, remove duplicates, set to lowercase
#TODO strip strings in list
#df[['fi','en','type']] = df[['fi','en','type']].map(str.lower) #TODO lowercase
import pandas as pd

df = pd.read_csv("vocab.csv",encoding='utf-8',index_col=0) #read from csv
#df = pd.read_json("vocab.json",encoding='utf-8').T #read from json

# -- data work
df[['course','verb type']] = df[['course','verb type']].astype('Int64') #cast to null+int
df = df.map(lambda x: x.strip().lower() if isinstance(x, str) else x) # cast to lowercase, strip end spaces

df = df[~df.duplicated(subset=['fi','en'],keep='first')] #toss duplicates
df = df.sort_values(by="fi",ignore_index=True) # sort

# -- checks
print(list(df['type'].unique()))
print(list(df['primary'].unique()))

# -- output

print(df)
df.T.to_json("vocab.json",force_ascii=False,indent=4)
df.to_csv("vocab.csv")
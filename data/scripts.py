import pickle

def displayStates(fp):
    infos = pickle.load(open(fp, 'rb'))
    states = [info['state'] for info in infos]
    for state in states:
        print(state)
        
def displayBitmaps(fp):
    infos = pickle.load(open(fp, 'rb'))
    bitmaps = [info['debug']['bitmap'] for info in infos]
    for bitmap in bitmaps[:50]:
        for row in bitmap:
            print(row)
        print()
        
head = 'data/'
# displayStates('infos.p')
displayBitmaps(head + 'infos.p')
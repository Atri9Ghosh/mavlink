import datetime

def log(*args):
    t = datetime.datetime.now().strftime("[%H:%M:%S]")
    print(t, *args, flush=True)

import csv

with open('K162_All_Stats.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    rows = list(reader)

with open('master_database.csv', 'r', encoding='utf-8') as f:
    master_header = f.readline().strip().split(',')

with open('master_database.csv', 'a', encoding='utf-8', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=master_header)
    for row in rows:
        writer.writerow(row)
print("Appended K162 to master_database.csv")

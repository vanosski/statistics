import csv

with open('master_database.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    rows = list(reader)

with open('master_database.csv', 'r', encoding='utf-8') as f:
    master_header = f.readline().strip().split(',')

with open('master_database.csv', 'w', encoding='utf-8', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=master_header)
    writer.writeheader()
    for row in rows:
        if row['Server'] == 'K277':
            row['Server'] = 'K27'
        writer.writerow(row)
print("Fixed K277 -> K27")

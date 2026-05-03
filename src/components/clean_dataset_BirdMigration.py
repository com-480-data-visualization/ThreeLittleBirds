import csv
import os

input_file = 'public/data/Bird_migration_dataset_renamed.csv'
output_file = 'public/data/Bird_migration_dataset_renamed_CLEAN.csv'

columns_to_drop = {
    "ID", "Migratory route codes", "Migration nodes", "Bird orders", "Bird families", "Bird genera", "Bird species", "Species Author", "Migration type", "The IUCN Red List (2023)", "Migration start year", "Migration start month", ",Migration end month", "Sensor types", "CONTINENTS", "Countries", "Provinces", "MIGRATION_PATTERN","Migration_routes", "References", "Publish time", "DOI"
}

def clean_dataset():
    print(f"Reading from: {input_file}...")
    
    with open(input_file, mode='r', encoding='utf-8-sig') as infile, \
         open(output_file, mode='w', newline='', encoding='utf-8') as outfile:
        
        reader = csv.reader(infile)
        writer = csv.writer(outfile)
        
        # 1. Read and process the header
        try:
            header = next(reader)
        except StopIteration:
            print("Error: The input file is empty.")
            return

        # Figure out the indices of the columns we actually want to keep
        indices_to_keep = [i for i, col in enumerate(header) if col.strip() not in columns_to_drop]
        
        # Write the new, shorter header
        new_header = [header[i] for i in indices_to_keep]
        writer.writerow(new_header)
        
        # 2. Process the rows one by one
        row_count = 0
        for row in reader:
            # Only keep the data at the allowed indices
            # (Adding a simple check in case a row is malformed and shorter than the header)
            new_row = [row[i] if i < len(row) else "" for i in indices_to_keep]
            writer.writerow(new_row)
            row_count += 1
            
    print(f"Finished processing {row_count} rows.")
    
    # 3. Calculate and display the size difference
    original_size = os.path.getsize(input_file) / (1024 * 1024)
    new_size = os.path.getsize(output_file) / (1024 * 1024)
    
    print("-" * 30)
    print(f"Original Size: {original_size:.2f} MB")
    print(f"New Size:      {new_size:.2f} MB")
    print(f"Reduction:     {100 - (new_size / original_size * 100):.1f}%")

if __name__ == "__main__":
    clean_dataset()
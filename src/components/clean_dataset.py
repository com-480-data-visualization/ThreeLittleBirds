import csv
import os

input_file = 'public/data/STRIKE_REPORTS.csv'
output_file = 'public/data/STRIKE_REPORTS_CLEAN.csv'

# Using a set for O(1) lookup time
columns_to_drop = {
    "AIRPORT", "RUNWAY", "STATE", "FAAREGION", "LOCATION", "ENROUTE_STATE", 
    "OPID", "OPERATOR", "REG", "FLT", "AIRCRAFT", "AMA", "AMO", "EMA", "EMO", 
    "AC_MASS", "TYPE_ENGINE", "NUM_ENGS", "ENG_1_POS", "ENG_2_POS", "ENG_3_POS", 
    "ENG_4_POS", "AOS", "COST_REPAIRS", "COST_OTHER", "COST_REPAIRS_INFL_ADJ", 
    "OTHER_SPECIFY", "EFFECT", "EFFECT_OTHER", "BIRD_BAND_NUMBER", "SPECIES_ID", 
    "SPECIES", "REMARKS", "REMAINS_COLLECTED", "REMAINS_SENT", "WARNED", 
    "NUM_SEEN", "NUM_STRUCK", "SIZE", "NR_INJURIES", "NR_FATALITIES", "COMMENTS", 
    "REPORTED_NAME", "REPORTED_TITLE", "SOURCE", "PERSON", "LUPDATE", "TRANSFER"
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
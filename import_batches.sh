#!/bin/bash

# Usage: ./import_batches.sh "YOUR_DATABASE_URL" "/path/to/csv_folder"

DB_URL="$1"
CSV_DIR="$2"

if [ -z "$DB_URL" ] || [ -z "$CSV_DIR" ]; then
    echo "Usage: ./import_batches.sh \"postgres://...\" \"/path/to/csv_folder\""
    exit 1
fi

echo "Starting Batch Import..."
echo "Database: $DB_URL"
echo "Directory: $CSV_DIR"

# Loop through all CSV files in the directory
for file in "$CSV_DIR"/*.csv; do
    if [ -f "$file" ]; then
        echo "----------------------------------------------------------------"
        echo "Processing: $file"
        
        # 1. Copy into Staging Table
        # We use psql's \copy meta-command.
        echo "  -> Uploading to Staging..."
        psql "$DB_URL" -c "\copy \"RawBusinessImport\"(\"number\", \"email\", \"companyType\", \"companyName\", \"documentNumber\", \"ein\", \"dateFiled\", \"state\", \"status\", \"principalAddress\", \"registeredAgentName\", \"firstOfficerName\", \"firstOfficerTitle\", \"secondOfficerName\", \"secondOfficerTitle\") FROM '$file' WITH (FORMAT csv, HEADER true);"
        
        # 2. Process Data (Insert into BusinessDocument)
        echo "  -> Transforming and Inserting into Main Table..."
        psql "$DB_URL" -c "
        INSERT INTO \"BusinessDocument\" (
            \"documentNumber\", \"email\", \"companyType\", \"companyName\", \"ein\", \"dateFiled\", \"state\", \"active\", \"principalAddress\", \"registeredAgentName\", \"firstOfficerName\", \"firstOfficerTitle\", \"secondOfficerName\", \"secondOfficerTitle\"
        )
        SELECT 
            \"documentNumber\", \"email\", \"companyType\", \"companyName\", \"ein\", 
            CASE 
                WHEN \"dateFiled\" IS NOT NULL AND \"dateFiled\" ~ '^[0-9]{1,2}/[0-9]{1,2}/[0-9]{4}' THEN TO_DATE(\"dateFiled\", 'MM/DD/YYYY')
                ELSE NULL 
            END,
            \"state\", 
            (\"status\" = 'ACTIVE'), 
            \"principalAddress\", \"registeredAgentName\", \"firstOfficerName\", \"firstOfficerTitle\", \"secondOfficerName\", \"secondOfficerTitle\"
        FROM \"RawBusinessImport\"
        WHERE \"documentNumber\" IS NOT NULL
          AND \"registeredAgentName\" IS NOT NULL
          AND \"companyType\" IS NOT NULL
          AND \"dateFiled\" ~ '^[0-9]{1,2}/[0-9]{1,2}/[0-9]{4}'
        ON CONFLICT (\"documentNumber\") DO NOTHING;
        "
        
        # 3. Clean Staging
        echo "  -> Clearing Staging Table..."
        psql "$DB_URL" -c "TRUNCATE TABLE \"RawBusinessImport\";"
        
        echo "Done with $file"
    fi
done

echo "----------------------------------------------------------------"
echo "All batches processed successfully."

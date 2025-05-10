import pandas as pd
from datetime import datetime
import numpy as np

def ext_time_comp (df):

    """
    Extract time components from transaction dates.
    Handles the format "d/m/y h/m" (e.g., "20/4/2025 20:55")
    """

    df['datetime'] = pd.to_datetime(df['transaction_date'], format= '%d/%m/%Y %H:%M')


    df['hour'] = df['datetime'].dt.hour
    df['day'] = df['datetime'].dt.day
    df['month'] = df['datetime'].dt.month
    df['year'] = df['datetime'].dt.year
    df['weekday'] = df['datetime'].dt.weekday  # 0 = Monday, 6 = Sunday
    df['weekday_name'] = df['datetime'].dt.day_name() 
    df['week_of_year'] = df['datetime'].dt.isocalendar().week
    df['quarter'] = df['datetime'].dt.quarter
    df['is_weekend'] = df['weekday'].isin([5, 6]).astype(int)

    df['time_of_day'] = pd.cut(
        df['hour'], 
        bins=[0, 6, 12, 18, 24], 
        labels=['Night', 'Morning', 'Afternoon', 'Evening'],
        include_lowest=True
    )

    df['day_part'] = pd.cut(
        df['day'],
        bins=[0, 10, 20, 31],
        labels=['Early Month', 'Mid Month', 'Late Month'],
        include_lowest=True
    )

    return df

try:
    # Read the CSV file
    df = pd.read_csv('jordan_transactions.csv')
    
    # Display a sample of the raw data to verify format
    print("Original data sample (first 3 rows):")
    print(df.head(3))
    
    # Check the format of transaction_date
    print("\nTransaction date examples:")
    print(df['transaction_date'].head(3).tolist())
    
    # Apply time component extraction
    df_processed = ext_time_comp(df)
    
    # Display results to verify
    print("\nProcessed data with time components (first 3 rows):")
    print(df_processed[['transaction_date', 'datetime', 'hour', 'day', 'month', 
                        'year', 'weekday_name', 'time_of_day']].head(3))
    
    # Save processed data if needed
    df_processed.to_csv('transactions_with_time_components.csv', index=False)
    
    print(f"\nSuccessfully processed {len(df_processed)} transactions")
    
    # Display some basic statistics
    print("\nTransactions by day of week:")
    print(df_processed['weekday_name'].value_counts().sort_index())
    
    print("\nTransactions by time of day:")
    print(df_processed['time_of_day'].value_counts().sort_index())
    
except Exception as e:
    print(f"Error processing the CSV file: {e}")
    
    # Try to diagnose common issues
    if "time data" in str(e) and "does not match format" in str(e):
        print("\nDate format issue detected. Please check the transaction_date column.")
        if 'df' in locals():
            print("Example dates from your file:")
            for i, date in enumerate(df['transaction_date'].head(5).tolist()):
                print(f"  Row {i+1}: '{date}'")
            
            # Try alternative parsing approach
            print("\nAttempting alternative parsing approach...")
            try:
                # Custom parser function to handle various formats
                def parse_flexible_date(date_str):
                    date_str = str(date_str).strip()
                    try:
                        return pd.to_datetime(date_str, dayfirst=True, errors='raise')
                    except:
                        return pd.NaT
                
                df['datetime'] = df['transaction_date'].apply(parse_flexible_date)
                print(f"Success rate: {(~df['datetime'].isna()).mean()*100:.1f}% of dates parsed successfully")
                if (~df['datetime'].isna()).any():
                    print("First 3 successful conversions:")
                    successful = df[~df['datetime'].isna()].head(3)
                    for i, row in successful.iterrows():
                        print(f"  '{row['transaction_date']}' → {row['datetime']}")
            except Exception as inner_e:
                print(f"Alternative approach failed: {inner_e}")


hourly_counts = df_processed.groupby('hour').size()
hourly_failure_rate = df_processed[df_processed['transaction_status'] == 'Failed'].groupby('hour').size() / hourly_counts 

weekday_counts = df_processed.groupby('weekday_name').size()
weekday_avg_amount = df_processed.groupby('weekday_name')['transaction_amount'].mean()

print("\nHourly Transaction Counts:")
print(hourly_counts)

print("\nHourly Failure Rate:")
print(hourly_failure_rate)

print("\nWeekday Transaction Counts:")
print(weekday_counts)

print("\nWeekday Average Transaction Amount:")
print(weekday_avg_amount)

peak_hours = df_processed.groupby('hour').size().sort_values(ascending=False).head(3)

# Average transaction amount by time of day
time_of_day_avg = df_processed.groupby('time_of_day')['transaction_amount'].agg(['mean', 'count', 'sum'])

print("\nPeak Hours are on:")
print(peak_hours)
print("\nPeak hours a day:")
print(time_of_day_avg)

branch_by_time = df_processed.groupby(['branch_name', 'time_of_day']).agg({
    'transaction_amount': ['mean', 'sum', 'count'],
    'transaction_status': lambda x: (x == 'Failed').mean() * 100  # Failure rate
}).round(2)

print("\nBranch by time:")
print(branch_by_time)


if __name__ == "__main__":
    test_df = pd.DataFrame({'transaction_date' : ['20/4/2025 20:55']})
    print (ext_time_comp(test_df).head()
           )

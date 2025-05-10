from fastapi import FastAPI
import pandas as pd
from Dates import ext_time_comp
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or restrict to ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Transaction analytics API is running."}

@app.get("/analyze")
def analyze_csv():
    try:
        df = pd.read_csv('jordan_transactions.csv')
        df_processed = ext_time_comp(df)

        hourly_counts = df_processed.groupby('hour').size().to_dict()
        hourly_failure_rate = (
            df_processed[df_processed['transaction_status'] == 'Failed']
            .groupby('hour').size() / df_processed.groupby('hour').size()
        ).fillna(0).round(2).to_dict()

        weekday_counts = df_processed.groupby('weekday_name').size().to_dict()
        weekday_avg_amount = df_processed.groupby('weekday_name')['transaction_amount'].mean().round(2).to_dict()

        peak_hours = df_processed.groupby('hour').size().sort_values(ascending=False).head(3).to_dict()

        time_of_day_avg = (
            df_processed.groupby('time_of_day')['transaction_amount']
            .agg(['mean', 'count', 'sum']).round(2).reset_index().to_dict(orient='records')
        )

        branch_by_time = (
            df_processed.groupby(['branch_name', 'time_of_day']).agg({
                'transaction_amount': ['mean', 'sum', 'count'],
                'transaction_status': lambda x: (x == 'Failed').mean() * 100
            }).round(2)
        )
        branch_by_time.columns = ['_'.join(col).strip() for col in branch_by_time.columns.values]
        branch_by_time = branch_by_time.reset_index().to_dict(orient='records')

        return {
            "hourly_transaction_counts": hourly_counts,
            "hourly_failure_rate": hourly_failure_rate,
            "weekday_transaction_counts": weekday_counts,
            "weekday_avg_amount": weekday_avg_amount,
            "peak_hours": peak_hours,
            "time_of_day_summary": time_of_day_avg,
            "branch_by_time": branch_by_time
        }

    except Exception as e:
        return {"error": str(e)}

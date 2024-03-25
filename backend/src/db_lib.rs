use super::screp_lib::UserResult;
use anyhow::Result;
use sqlx::sqlite;
use sqlx::Connection;
use chrono::NaiveDate;

pub async fn save_to_db(user_results: &Vec<UserResult>, conn: &mut sqlite::SqliteConnection) -> Result<()> {
    let mut transaction = conn.begin().await?;
    for result in user_results {
        let formatted_date = result.date.format("%Y-%m-%d").to_string();
        sqlx::query!(
            "INSERT INTO user_results (username, date, perf) VALUES (?, ?, ?)",
            result.username,
            formatted_date,
            result.perf
        )
        .execute(&mut *transaction)
        .await?;
    }

    transaction.commit().await?;

    Ok(())
}

pub async fn load_user_results(month: u32, conn: &mut sqlite::SqliteConnection) -> Result<Vec<UserResult>> {
    struct T {
        username: String,
        perf: i64,
        date: String,
    }
    let month = format!("%-{:02}-%", month);
    let user_results = sqlx::query_as!(T, "SELECT username, date, perf FROM user_results WHERE date LIKE ?", month)
        .fetch_all(conn)
        .await
        .unwrap();

    let mut results = vec![];
    for res in user_results {
        results.push(UserResult {
            username: res.username,
            perf: res.perf,
            date: NaiveDate::parse_from_str(&res.date, "%Y-%m-%d").unwrap(),
        });
    }

    Ok(results)
}

mod screp_lib;
mod db_lib;
mod crawler;
mod user;

use anyhow::{Result, Context};
use sqlx::Connection;
use std::collections::BTreeMap;
use std::io::Write;
use std::fs::File;
use clap::Parser;
use chrono::prelude::*;

use crate::user::RatingResult;

async fn fetch_latest_mayocon(mut conn: &mut sqlx::SqliteConnection) -> Result<()> {
    let today = chrono::Utc::now();
    let result = crawler::get_mayocon_result(today).with_context(|| "Failed to get mayocon result.")?;
    db_lib::save_to_db(&result, &mut conn).await.with_context(|| "Failed to save to db.")?;
    Ok(())
}

async fn update_rate(month: u32, mut conn: &mut sqlx::SqliteConnection) -> Result<()> {
    let datas = db_lib::load_user_results(month, &mut conn).await.with_context(|| "Failed to load user results.")?;

    let mut mp: BTreeMap<String, user::User> = BTreeMap::new();
    for usr in datas {
        let data = mp.entry(usr.username).or_insert(user::User::new());
        data.add_contest_result(usr.perf, usr.date);
    }


    #[derive(serde::Serialize)]
    struct UserRating {
        username: String,
        history: Vec<RatingResult>,
    }
    let mut users_rating = vec![];
    for (username, mut user) in mp {
        users_rating.push( UserRating {
            username,
            history: user.rate(),
        });
    }

    let json = serde_json::to_string(&users_rating).unwrap();

    let path = format!("rate/{}.json", chrono::Utc::now().format("%m"));
    let mut f = File::create(path).unwrap();
    f.write_all(json.as_bytes()).unwrap();

    Ok(())
}

#[derive(Parser, Debug)]
struct Args {
    #[arg(short, long)]
    contest_id: Option<String>,

    #[arg(short, long)]
    month: Option<u32>,

    #[arg(short, long)]
    only_rate: bool,
}

#[tokio::main]
async fn main() -> Result<()> {
    let mut conn = sqlx::sqlite::SqliteConnection::connect("sqlite:data.db").await.unwrap();

    let args = Args::parse();
    let month = if let Some(month) = args.month {
        month
    } else {
        chrono::Utc::now().month()
    };

    if args.only_rate {
        update_rate(month, &mut conn).await?;
        return Ok(());
    }

    let contest_id = args.contest_id;
    if let Some(id) = contest_id {
        let result = crawler::fetch_contest_result(&id)
            .with_context(|| format!("Failed to fetch contest result. id = {}", id))?;
        db_lib::save_to_db(&result, &mut conn).await?;
    } else {
        fetch_latest_mayocon(&mut conn).await?;
    }

    update_rate(month, &mut conn).await?;

    Ok(())
}

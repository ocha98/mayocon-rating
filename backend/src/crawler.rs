use anyhow::{anyhow, Result};
use chrono::{DateTime, NaiveDate};
use chrono::prelude::*;
use chrono::Utc;

use super::screp_lib;

fn fetch_html(url: &str) -> Result<String> {
    let browser = headless_chrome::Browser::default()?;
    let tab = browser.new_tab()?;
    tab.navigate_to(url)?;
    tab.wait_until_navigated()?;
    let html = tab.get_content()?;
    Ok(html)
}

fn is_same_date(date1: NaiveDate, date2: DateTime<Utc>) -> bool {
    date1.year() == date2.year() && date1.month() == date2.month() && date1.day() == date2.day()
}

pub fn fetch_contest_result(id: &str) -> Result<Vec<screp_lib::UserResult>>{
    let url = format!("https://kenkoooo.com/atcoder/#/contest/show/{}?activeTab=Standings", id);
    let html = fetch_html(&url).unwrap();
    screp_lib::get_contest_result(&html)
}

pub fn get_mayocon_result(date: DateTime<Utc>) -> Result<Vec<screp_lib::UserResult>> {
    let url = "https://kenkoooo.com/atcoder/#/contest/recent";
    let html = fetch_html(url)?;
    let recent_contests = screp_lib::get_recent_contests(&html)?;
    let mut id = None;
    for contest in recent_contests {
        if contest.title == "まよコン" && is_same_date(contest.date, date) {
            id = Some(contest.id);
            break;
        }
    }

    if id.is_none() {
        return Err(anyhow!( format!("failed to find mayocon contest at {}.", date.to_rfc3339())));
    }

    let url = format!("https://kenkoooo.com/atcoder/#/contest/show/{}?activeTab=Standings", id.unwrap());
    let html = fetch_html(&url)?;
    screp_lib::get_contest_result(&html)
}

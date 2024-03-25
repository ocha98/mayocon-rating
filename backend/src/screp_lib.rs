use chrono::NaiveDate;
use anyhow::{anyhow, Result};

pub struct UserResult {
    pub username: String,
    pub perf: i64,
    pub date: NaiveDate,
}

pub struct ContestInfo {
    pub title: String,
    pub id: String,
    pub date: NaiveDate,
}

pub fn get_recent_contests(html: &str) -> Result<Vec<ContestInfo>>{
    let document = scraper::Html::parse_document(&html);
    let recent_contests_table_selector = scraper::Selector::parse("#root > div > div.my-5.container > div:nth-child(6) > div > div > div.react-bs-table.react-bs-table-bordered > div.react-bs-container-body > table > tbody > tr").unwrap();
    let title_selector = scraper::Selector::parse("td:nth-child(1)").unwrap();
    let id_selector = scraper::Selector::parse("td:nth-child(1) > a").unwrap();
    let date_selector = scraper::Selector::parse("td:nth-child(4)").unwrap();


    let mut res = vec![];

    for elem in document.select(&recent_contests_table_selector) {
        let title = elem.select(&title_selector).next().ok_or(anyhow!("failed to get title element."))?;
        let date = elem.select(&date_selector).next().ok_or(anyhow!("failed to get date element."))?;
        let id = elem.select(&id_selector).next().ok_or(anyhow!("failed to get id element."))?;


        let id = id.value().attr("href").ok_or(anyhow!("failed to get id."))?.to_string();
        let id = id.split("/").last().ok_or(anyhow!("failed to get id."))?.to_string();

        let title = title.text().collect::<String>();
        let date = date.text().collect::<String>();

        let re = regex::Regex::new(r"\d{4}-\d{2}-\d{2}").unwrap();
        let date = re.find(&date).ok_or(anyhow!("failed to find date."))?.as_str();

        res.push(ContestInfo {
            title,
            id,
            date: NaiveDate::parse_from_str(&date, "%Y-%m-%d")?,
        });
    }

    Ok(res)
}


pub fn get_contest_result(html: &str) -> Result<Vec<UserResult>> {
    let document = scraper::Html::parse_document(html);
    let table_selector = scraper::Selector::parse("#root > div > div.my-5.container > div:nth-child(6) > div:nth-child(2) > div > table > tbody > tr").unwrap();
    let username_selector = scraper::Selector::parse(&"th.text-left.align-middle > a").unwrap();
    let perf_selector = scraper::Selector::parse(&"td.align-middle > p").unwrap();

    let date_selector = scraper::Selector::parse(&"#root > div > div.my-5.container > div:nth-child(3) > div:nth-child(1) > table > tbody > tr:nth-child(1) > td").unwrap();

    let date = document.select(&date_selector).next().ok_or(anyhow!("failed to get date element."))?;
    let date_text = date.text().collect::<String>();

    let re = regex::Regex::new(r"\d{4}-\d{2}-\d{2}").unwrap();
    let date_text = re.find(&date_text).ok_or(anyhow!("failed to find date."))?.as_str();

    let date = NaiveDate::parse_from_str(date_text, "%Y-%m-%d")?;

    let mut results = vec![];
    for element in document.select(&table_selector) {
        let Some( username ) = element.select(&username_selector).next() else { break; };
        let Some( perf ) = element.select(&perf_selector).next() else { return Err(anyhow!("failed to get perf element.")) };
        results.push(UserResult {
            username: username.text().collect::<String>(),
            perf: perf.text().collect::<String>().parse::<i64>()?,
            date,
        });
    }

    Ok( results )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_get_recent_contests() {
        // recent_contest.htmlを読み込む
        let html = std::fs::read_to_string("tests/recent_contests.html").unwrap();
        let contests = get_recent_contests(&html).unwrap();
        assert_eq!(contests.len(), 10);

        assert_eq!(contests[0].title, "Public あさかつ3/25 ARC");
        assert_eq!(contests[0].date, NaiveDate::from_ymd_opt(2024, 3, 25).unwrap());
        assert_eq!(contests[0].id, "8e6faef9-e924-422a-b334-8f1d3450f75c");

        assert_eq!(contests[9].title, "Public あさかつ3/23 ARC");
        assert_eq!(contests[9].date, NaiveDate::from_ymd_opt(2024, 3, 23).unwrap());
        assert_eq!(contests[9].id, "ed172ef4-1807-4bc6-a1fa-b40a19b59582")
    }

    #[test]
    fn test_get_contest_result() {
        let html = std::fs::read_to_string("tests/contest_result.html").unwrap();
        let results = get_contest_result(&html).unwrap();
        assert_eq!(results.len(), 20);
        assert_eq!(results[0].username, "mayocorn");
        assert_eq!(results[0].perf, 2538);
        assert_eq!(results[0].date, NaiveDate::from_ymd_opt(2024, 3, 21).unwrap());

        assert_eq!(results[4].username, "shinnshinn");
        assert_eq!(results[4].perf, 1788);
        assert_eq!(results[4].date, NaiveDate::from_ymd_opt(2024, 3, 21).unwrap());

        assert_eq!(results[19].username, "yamaga");
        assert_eq!(results[19].perf, 2);
        assert_eq!(results[19].date, NaiveDate::from_ymd_opt(2024, 3, 21).unwrap());

    }
}
use chrono::NaiveDate;
use serde;

struct ContestResult {
    perf: i64,
    date: NaiveDate,
}

#[derive(serde::Serialize)]
pub struct RatingResult {
    pub rate: i64,
    pub date: String,
}

pub struct User {
    contest_history: Vec<ContestResult>,
}

impl User {
    pub fn new() -> Self {
        Self {
            contest_history: Vec::new(),
        }
    }

    pub fn add_contest_result(&mut self, perf: i64, date: NaiveDate) {
        self.contest_history.push(ContestResult { perf, date });
    }

    #[allow(non_snake_case)]
    fn F(n: u32) -> f64{

        let mut pow81 = 1.0;
        let mut pow9  = 1.0;
        let mut sumc: f64 = 0.0;
        let mut sump: f64 = 0.0;
        for _ in 0..n {
            pow81 *= 0.81;
            pow9 *= 0.9;
            sumc += pow81;
            sump += pow9;
        }

        sumc.sqrt() / sump
    }

    fn f(n: u32) -> f64 {
        #[allow(non_snake_case)]
        let  inf_F: f64 = Self::F(400);
        1200.0 * (Self::F(n) - inf_F) / (Self::F(1) - inf_F)
    }

    fn g(x: i64) -> f64 {
        2.0f64.powf(x as f64 / 800.0)
    }

    pub fn rate(&mut self) -> Vec<RatingResult> {
        self.contest_history.sort_unstable_by_key(|usr| usr.date);

        let mut sumc = 0.0;
        let mut sump = 0.0;
        let mut rating_history = vec![];
        for (i, usr) in self.contest_history.iter().enumerate() {
            sumc = (Self::g(usr.perf) + sumc) * 0.9;
            sump = (sump + 1.0) * 0.9;


            let mut rate = (sumc/sump).log(2.0) * 800.0;
            rate  -= Self::f((i+1) as u32);

            if rate < 400.0 {
                rate = 400.0 / ((400.0 - rate) / 400.0).exp();
            }

            rating_history.push(RatingResult { rate: rate.round() as i64, date: usr.date.format("%Y-%m-%d").to_string() });
        }

        rating_history
    }
}

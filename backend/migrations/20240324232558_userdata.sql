-- Add migration script here
CREATE TABLE user_results (
    username VARCHAR(20) NOT NULL,
    date TEXT NOT NULL,
    perf INTEGER NOT NULL,
    PRIMARY KEY (username, date)
);

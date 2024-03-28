import { Container, Table } from "react-bootstrap";
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import fs from "fs";
import Rating from "@/compornents/Rating";
import Head from "next/head";
import style from "@/styles/Home.module.css";
import Link from "next/link";

export default function Home({data}: {data: {month: string, data: UserData[]}[]}) {
  data.sort((a, b) => parseInt(b.month) - parseInt(a.month));
  data.forEach((d) => {
    d.data.sort((a, b) => b.history[0].rate - a.history[0].rate)
  })
  return (
    <Container>
      <Head>
        <title>まよコン🌽レート</title>
        <meta name="description" content="まよコンのパフォからレートを計算しています。毎月リセットされます。" />
        <meta name="twitter:card" content="summary" />
        <meta property="og:url" content="https://mayocon.shinnshinn.dev/" />
        <meta property="og:title" content="まよコンレート" />
        <meta property="og:description" content="パフォからレートを計算しています" />
        <meta property="og:image" content="https://mayocon.shinnshinn.dev/corn.png" />:
      </Head>
      <Tabs
        defaultActiveKey={data[0].month}
        className="mb-3"
      >
        {
          data.map((d) => {
            return (
              <Tab eventKey={d.month} title={`${d.month}月`} key={d.month}>
                <Table className="text-center fs-5" striped bordered hover>
                  <thead>
                    <tr>
                      <th>順位</th>
                      <th>ユーザー名</th>
                      <th>レーティング</th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      d.data.map((d, idx) => {
                        return (
                          <tr key={idx}>
                              <td>{idx + 1}</td>
                              <td>
                                <Link className={style.username} href={`/${d.username}`}>
                                  <Rating rate={d.history[0].rate} txt={d.username} />
                                </Link>
                                <a className={style.username} href={`https://atcoder.jp/users/${d.username}`} target="_blank" rel="noopener noreferrer">
                                </a>
                              </td>
                              <td>{d.history[0].rate}</td>
                          </tr>
                        )
                      })
                    }
                  </tbody>
                </Table>
              </Tab>
            )
          })
        }
      </Tabs>
    </Container>
  );
}

export async function getStaticProps() {
  const dir = "./data";
  const files = fs.readdirSync(dir);
  const data = files.filter((files) => files.endsWith(".json"))
    .map((files) => {
      const json = fs.readFileSync(`${dir}/${files}`, "utf-8");
      const data: UserData[] = JSON.parse(json);
      data.forEach((userdate) => {
        userdate.history.sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
      })
      data.sort((a, b) => b.history[b.history.length - 1].rate - a.history[a.history.length - 1].rate);
      return { month: files.replace(".json", ""), data};
    });


  return {
    props: {data},
  }
}

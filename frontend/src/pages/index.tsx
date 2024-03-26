import { Container, Table } from "react-bootstrap";
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import fs from "fs";
import Rating from "@/compornents/Rating";
import Head from "next/head";
import style from "@/styles/Home.module.css";

export default function Home({data}: {data: {month: string, data: UserData[]}[]}) {
  data.sort((a, b) => parseInt(b.month) - parseInt(a.month));
  data.forEach((d) => {
    d.data.sort((a, b) => b.rate - a.rate);
  });

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
      <div className="py-5 text-center">
        <h1>まよコン🌽 レーティング</h1>
        <div className="my-3">
          <p>毎月リセットされます</p>
          <p>
            <a href="https://github.com/ocha98/mayocon-rating" target="_blank" rel="noopener noreferrer">GitHub</a><br/>
            <a href="https://discord.gg/exFTabXHhA" target="_blank" rel="noopener noreferrer">Discord</a>
          </p>
        </div>
      </div>
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
                                <a className={style.username} href={`https://atcoder.jp/users/${d.username}`} target="_blank" rel="noopener noreferrer">
                                  <Rating rate={d.rate} txt={d.username} />
                                </a>
                              </td>
                              <td>{d.rate}</td>
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
      return { month: files.replace(".json", ""), data};
    });

  return {
    props: {data},
  }
}

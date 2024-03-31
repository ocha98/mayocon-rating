import { Container, Table } from "react-bootstrap";
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Rating from "@/compornents/Rating";
import Head from "next/head";
import style from "@/styles/Home.module.css";
import Link from "next/link";
import { loadRatingData } from "@/lib/backend";

type Props = {
  data: {month: string, data: UserData[]}[]
}

export default function Home({ data }: Props) {
  // sort decreasing order by month
  const sortedData = data.sort((a, b) => parseInt(b.month) - parseInt(a.month))

  const processedData = sortedData.map((monthData) => {
      const processedUserData = monthData.data.map((userData): UserData =>  {
        // sort decreasing order by date
        const sortedHistory = userData.history.sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
        return { ...userData, history: sortedHistory }
      })

      // sort decreasing order by rate
      const sortedUserData = processedUserData.sort((a, b) => b.history[0].rate - a.history[0].rate)

      return { month: monthData.month, data: sortedUserData}
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
        defaultActiveKey={processedData[0].month}
        className="mb-3"
      >
        {
          processedData.map((d) => {
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

export async function getStaticProps(): Promise<{props: Props}> {
  const data = await loadRatingData()

  return {
    props: { data },
  }
}

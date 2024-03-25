import { Container, Table } from "react-bootstrap";
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import fs from "fs";
import Rating from "@/compornents/Rating";

export default function Home({data}: {data: {month: string, data: UserData[]}[]}) {
  data.forEach((d) => {
    d.data.sort((a, b) => b.rate - a.rate);
  });

  return (
    <Container>
      <div className="py-5 text-center">
        <h1>まよコン🌽 レーティング</h1>
        <p className="my-3">毎月リセットされます</p>
      </div>
      <Tabs
        defaultActiveKey="profile"
        id="uncontrolled-tab-example"
        className="mb-3"
      >
        {
          data.map((d) => {
            return (
              <Tab eventKey={d.month} title={`${d.month}月`}>
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
                          <tr>
                              <td>{idx + 1}</td>
                              <td><Rating rate={d.rate} txt={d.username} /></td>
                              <td>
                                {d.rate}
                              </td>
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

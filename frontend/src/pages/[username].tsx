import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  ChartOptions,
  TimeScale,
  Plugin
} from "chart.js";
import "chartjs-adapter-date-fns";
import { Container, Tab, Tabs } from "react-bootstrap";
import { Line } from "react-chartjs-2";
import { loadRatingData } from "@/lib/backend";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  TimeScale,
  Tooltip,
  Legend,
);

type Props = {
  username: string;
  data: { month: string, data: UserData }[];
}

const Colors = [
  "#afafaf",
  "#946b56",
  "#56bc76",
  "#68dbd7",
  "#5d80d2",
  "#c4d25d",
  "#f3a94f",
  "#f05f5f",
] as const

const Graph = ({username, data}: Props) => {
  data.sort((a, b) => Date.parse(b.month) - Date.parse(a.month));
  const options: ChartOptions<"line"> = {
    animation: false,
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day'
        }
      },
      y: {
        ticks: {
          stepSize: 400,
        }
      }
    },
  }

  const plugins: Plugin[] = [{
    id: 'bg-color',
    beforeDraw: (chart) => {
      const {ctx, chartArea: {left, top, width, bottom}, scales: {x, y}} = chart;
      ctx.save();
      for(let i = 0;i < Colors.length-1; ++i) {
        ctx.fillStyle = Colors[i];
        let startY = y.getPixelForValue((i+1) * 400)
        let endY = y.getPixelForValue(i * 400)
        if(endY < 0) continue;
        if(startY > bottom) continue;
        startY = Math.max(startY, top);
        endY = Math.min(endY, bottom);
        ctx.fillRect(left, startY, width, endY - startY);
      }

      ctx.fillStyle = Colors[Colors.length-1];
      let startY = top;
      let endY = y.getPixelForValue((Colors.length-1)*400);
      if(endY < 0) return;
      ctx.fillRect(left, top, width, endY - startY);

      ctx.restore();
    }
  }]

  return (
    <Container>
      <div>
        <p></p>
      </div>
      <Tabs defaultActiveKey={data[0].month}>
      {
        data.map(({month, data}, idx) => {
          const xy = data.history.map((d) => {
            return { x: d.date, y: d.rate }
          })
          const rating = {
            datasets: [
              {
                label: username,
                data: xy,
                borderColor: "#808080",
              },
            ],
          }
          return (
          <Tab eventKey={month} key={idx} title={month}>
            <Line
              options={options}
              data={rating}
              plugins={plugins}
            />
          </Tab>
          )
        })
      }
      </Tabs>
    </Container>
  );
};

export default Graph;

export const getStaticPaths = async () => {
  const data = await loadRatingData()
  const set: Set<string> = new Set()
  data.forEach((d) => {
    d.data.forEach((d) => {
      set.add(d.username)
    })
  })

  const paths = Array.from(set).map((username) => { return { params: {username}} } )

  return {
    paths,
    fallback: false,
  }
}

export const getStaticProps = async ({params}: {params: {username: string}}): Promise<{props: Props}> => {
  const data = await loadRatingData()
  const userdata = []
  for(let i = 0;i < data.length; ++i) {
    if(data[i].data.filter((d) => d.username == params.username).length == 0) continue
    userdata.push(
      {
        month: data[i].month,
        data: data[i].data.filter((d) => d.username == params.username)[0]
      }
    )
  }

  return {
    props: {
      username: params.username,
      data: userdata,
    },
  }
}

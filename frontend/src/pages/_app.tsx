import "bootstrap/dist/css/bootstrap.min.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return(<>
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
    <Component {...pageProps} />;
  </>)
}


const Colors = [
  "#5f5f5f", // 灰
  "#864A2B", // 茶
  "#04aa4b", // 緑
  "#00d0f0", // 水
  "#1102d7", // 青
  "#bac127", // 黄
  "#ff8c00", // 橙
  "#ff0000", // 赤
];

const Rating = ({ rate, txt }: { rate: number, txt: string }) => {
  const idx = Math.floor(rate / 400);
  const color = Colors[Math.min(Colors.length - 1, idx)];
  return (
    <span style={ { color: color}}>
        {txt}
    </span>
  )
}

export default Rating
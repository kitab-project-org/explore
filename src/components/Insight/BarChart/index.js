import Chart from "./Chart";

function TopTenBooks({ data, width }) {
  return (
    <div className="App">
      <h2>Top 10 Largest Books</h2>
      <Chart width={width} height={600} data={data} />
    </div>
  );
}

export default TopTenBooks;

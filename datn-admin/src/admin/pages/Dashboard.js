import React, { useState, useEffect } from "react";
import statusCards from "../../assets/JsonData/status-card-data.json";
import StatusCard from "../status-card/StatusCard";
import Chart from "react-apexcharts";
import { Link, NavLink } from "react-router-dom";
import {
  reportByProduct,
  reportAmountYear,
  reportAmountMonth,
  countOrder,
  countOrderByName,
  reportAmountCategory
} from "../../api/OrderApi";
import { countAccount } from "../../api/AccountApi";
import { countProduct } from "../../api/ProductApi";

const Dashboard = () => {
  const [product, setProduct] = useState([]);
  const [year, setYear] = useState([]);
  const [total, setTotal] = useState();
  const [countOr, setCountOr] = useState();
  const [countAcc, setCountAcc] = useState();
  const [countPro, setCountPro] = useState();
  const [seri, setSeri] = useState([]);
  const [option, setOption] = useState({});
  const [selectedYearBar, setSelectedYearBar] = useState(null);
  const [barSeries, setBarSeries] = useState([]);
  const [barOptions, setBarOptions] = useState({});
  const [selectedYearCat, setSelectedYearCat] = useState(null);
  const [selectedMonthCat, setSelectedMonthCat] = useState(new Date().getMonth() + 1);
  const [catSeries, setCatSeries] = useState([]);
  const [catOptions, setCatOptions] = useState({});
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);
  const currentYear = new Date().getFullYear();
  const [yearOptions, setYearOptions] = useState([]);

  useEffect(() => {
    reportByProduct(1, 8)
      .then((resp) => {
        setProduct(resp.data.content);
      })
      .catch((error) => console.log(error));

    reportAmountYear()
      .then((resp) => {
        setYear(resp.data);
        const result = resp.data.reduce((price, item) => price + item.total, 0);
        setTotal(result);
        // Build year options from earliest API year to current year
        const apiYears = resp.data.map(item => item.year);
        const minYear = Math.min(...apiYears, currentYear);
        const options = [];
        for (let y = minYear; y <= currentYear; y++) {
          options.push(y);
        }
        setYearOptions(options);
        // Default selections to current year
        setSelectedYearBar(currentYear);
        setSelectedYearCat(currentYear);
      })
      .catch((error) => console.log(error));

    countOrder()
      .then((resp) => setCountOr(resp.data))
      .catch((error) => console.log(error));

    countAccount()
      .then((resp) => setCountAcc(resp.data))
      .catch((error) => console.log(error));

    countProduct()
      .then((resp) => setCountPro(resp.data))
      .catch((error) => console.log(error));

    countOrderByName()
      .then((resp) => {
        const x = resp.data.map((item) => item.name);
        setOption({
          labels: x,
        });
        const y = resp.data.map((item) => item.count);
        setSeri(y);
      })
      .catch((error) => console.log(error));
  }, []);

  useEffect(() => {
    if (selectedYearBar) {
      reportAmountMonth(selectedYearBar)
        .then((resp) => {
          const data = resp.data.sort((a, b) => a.month - b.month);
          const categories = data.map((item) => `Tháng ${item.month}`);
          const seriesData = data.map((item) => item.total);
          setBarOptions({ chart: { id: 'bar-chart' }, xaxis: { categories } });
          setBarSeries([{ name: 'Doanh thu', data: seriesData }]);
        })
        .catch((error) => console.log(error));
    }
  }, [selectedYearBar]);

  useEffect(() => {
    if (selectedYearCat && selectedMonthCat) {
      reportAmountCategory(selectedYearCat, selectedMonthCat)
        .then((resp) => {
          const data = resp.data;
          const labels = data.map((item) => item.categoryName);
          const seriesData = data.map((item) => item.total);
          setCatOptions({ labels });
          setCatSeries(seriesData);
        })
        .catch((error) => console.log(error));
    }
  }, [selectedYearCat, selectedMonthCat]);

  return (
    <div>
      <h2 className="page-header">Thống kê</h2>
      <div className="row">
        <div className="col-6">
          <div className="row container-fluid">
            <div className="col">
              <StatusCard
                icon={statusCards[0].icon}
                count={countAcc}
                title={`Khách hàng`}
              />
              <StatusCard
                icon={statusCards[1].icon}
                count={countPro}
                title={`Sản phẩm`}
              />
              <StatusCard
                icon={statusCards[3].icon}
                count={countOr}
                title={`Đơn hàng`}
              />
              <StatusCard
                icon={statusCards[2].icon}
                count={total && total.toLocaleString()}
                title={`Tổng doanh thu`}
              />
            </div>
          </div>
        </div>
        <div className="col-6">
          <div className="card full-height">
            <Chart options={option} series={seri} type="donut" height="100%" />
          </div>
        </div>
        <div className="col-6">
          <div className="card">
            <div className="card__header">
              <h3 className="text-primary">Doanh thu theo sản phẩm</h3>
            </div>
            <div className="card__body">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th scope="col">Mã sản phẩm</th>
                    <th scope="col">Tên sản phẩm</th>
                    <th scope="col">Số lượng bán</th>
                    <th scope="col">Doanh thu</th>
                  </tr>
                </thead>
                <tbody>
                  {product &&
                    product.map((item, index) => (
                      <tr key={index}>
                        <th scope="row">
                          <NavLink to={`/order-product/${item.id}`} exact>
                            {" "}
                            {item.id}
                          </NavLink>
                        </th>
                        <td>{item.name}</td>
                        <td>{item.count}</td>
                        <td>{item.amount.toLocaleString()} đ</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <div className="card__footer">
              <Link to="/report-product">Xem chi tiết</Link>
            </div>
          </div>
        </div>
        <div className="col-6">
          <div className="card">
            <div className="card__header">
              <h3 className="text-primary">Doanh thu theo Năm</h3>
            </div>
            <div className="card__body">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th scope="col">STT</th>
                    <th scope="col">Năm</th>
                    <th scope="col">Số lượng đơn</th>
                    <th scope="col">Doanh thu</th>
                  </tr>
                </thead>
                <tbody>
                  {year &&
                    year.map((item, index) => (
                      <tr key={index}>
                        <th scope="row">
                          <NavLink exact to={`/report-month/${item.year}`}>
                            {index + 1}
                          </NavLink>
                        </th>
                        <td>{item.year}</td>
                        <td>{item.count}</td>
                        <td>{item.total && item.total.toLocaleString()} đ</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <div className="card__footer">
              <NavLink exact to={`/report-month/2022`}>
                Xem chi tiết
              </NavLink>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-6">
          <div className="card">
            <div className="card__header d-flex justify-content-between align-items-center">
              <h3 className="text-primary">Doanh thu theo tháng</h3>
              <select className="form-select w-auto" value={selectedYearBar} onChange={e => setSelectedYearBar(parseInt(e.target.value))}>
                {yearOptions.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div className="card__body">
              <Chart options={barOptions} series={barSeries} type="bar" height="350" />
            </div>
          </div>
        </div>
        <div className="col-6">
          <div className="card full-height">
            <div className="card__header d-flex justify-content-between align-items-center">
              <h3 className="text-primary">Doanh thu theo danh mục</h3>
              <div className="d-flex">
                <select className="form-select w-auto me-2" value={selectedYearCat} onChange={e => setSelectedYearCat(parseInt(e.target.value))}>
                  {yearOptions.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <select className="form-select w-auto" value={selectedMonthCat} onChange={e => setSelectedMonthCat(parseInt(e.target.value))}>
                  {monthOptions.map(m => (
                    <option key={m} value={m}>{`Tháng ${m}`}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="card__body">
              <Chart options={catOptions} series={catSeries} type="donut" height="100%" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

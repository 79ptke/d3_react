import React, { useEffect } from 'react';
import { select } from "d3"; 

const D3Chart = () => {
  useEffect(() => {
    const month = "10"; //selectbox에서 10일때 
        const year = "2022";
        var dateArr = [];

        // fetch로 json 받아오기
        function getData() {
            var monthDate = new Date(year,month,0).getDate();
            fetch('./faithful3.json')
                .then(res => res.json())
                .then((data) => {  
                    var dailyDataMap = new Map();
                    data.forEach(item => {
                        var dateParts = item.date.split('-');
                        var day = parseInt(dateParts[2]);
                        if (dailyDataMap.has(day)) {
                            var existingData = dailyDataMap.get(day);
                            existingData.count += 1;
                            existingData.total += item.cost_price;
                        } else {
                            dailyDataMap.set(day, { count: 1, total: item.cost_price });
                        }
                    });

                    // 1일부터 마지막 날까지 순차적으로 데이터를 생성합니다.
                    var dateArr = [];
                    for (var i = 1; i <= monthDate; i++) {
                        var cost_price = 0;
                        var count = 0;
                        if (dailyDataMap.has(i)) {
                            var dailyData = dailyDataMap.get(i);
                            count = dailyData.count;
                            cost_price = dailyData.total;
                        }
                        dateArr.push({ "date": i, "cost_price": cost_price, "count": count });
                    }

                    console.log(dateArr);

                    // 막대 그래프에 넣을 데이터
                    var dataSet = dateArr;

                    
        
            // 막대 그래프에 넣을 데이터
            var dataSet = d3.nest() //d3.nest()는 .key() method를 이용하여 '데이터의 무엇을 key로 해서 데이터를 수집할 지' 를 지정할 수 있다.
                    .key(function(d) {
                        return d.date; 
                    })
                    .rollup(function(v) {
                        if(v[0].cost_price == 0) { // cost_price이 0원일때
                            return {
                            count: 0,
                            total: d3.sum(v, function(d) { return d.cost_price; })
                            }; 
                        } else {
                            return {
                            //count: v.length,
                            count: d3.sum(v, function(d) { return d.count; }),
                            total: d3.sum(v, function(d) { return d.cost_price; })
                            }; 
                        }
                    })
                    .entries(dateArr); 
                    console.log(dataSet);
                dataSet.sort(function(a,b) { // 그냥 dataLine에 있는 값을 line chart에 넣으면 정렬이 안되어 있어 line이 꼬이므로 
                    return a.key - b.key; // sort를 사용해서 key값을 오름차순으로 정렬했다.
                });

            // 막대 그래프
            svg.insert("g", "*")
                .attr("fill", "#9ff")
                .selectAll("rect")
                .data(dataSet)
                .enter().append("rect")
                .attr("x", function(d) { return x(d.key) + 48; }) 
                .attr("y", function(d) { return 70 - ((y(d.value.total / 10000))*-1); })
                .attr("width", function(d) { return x(1.5); })
                .attr("height", function(d) { return y(0) - y(d.value.total / 10000); })       
                // 마우스오버
                .text(function(d) { return d.x0; })
                .on("mouseover", function(d){tooltip.html([year + '년' + month + '월' + d.key + '일',] + "</br>" + [ d.value.total.toLocaleString() + '원',] + "</br>" + [ d.value.count + '건']); return tooltip.style("visibility", "visible");}) // 마우스 오버 데이터 값
                .on("mousemove", function(){return tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");}) // tooltip 위치
                .on("mouseout", function(){return tooltip.style("visibility", "hidden");});

            // 선 그래프 영역
            svg.append("path")
                .datum(dataSet)
                .attr("fill", "none")
                .attr("stroke", "#f9f") // 선 색상
                .attr("stroke-width", 1.5) // 선 굵기
                .attr("stroke-linejoin", "round") // 선 모양
                .attr("d",  d3.line()
                        //.curve(d3.curveBasis) 
                        .defined(d => !isNaN(d.value.count))
                        .x(d => x(d.key) + 55)
                        .y(d => y(d.value.count) + 70))

            // 도트 추가
            svg.append("g")
                .selectAll("dot")
                .data(dataSet)
                .enter()
                .append("circle")
                    .attr("cx", d => x(d.key) + 55)
                    .attr("cy", d => y(d.value.count) + 70)
                    .attr("r", 5)
                    .attr("stroke", '#f9f')
                    .attr("stroke-width", 4)
                    .attr("fill", "white")
                    // 마우스오버
                    .text(function(d) { return d.x0; })
                    .on("mouseover", function(d){tooltip.html([year + '년' + month + '월' + d.key + '일',] + "</br>" + [ d.value.total.toLocaleString() + '원',] + "</br>" + [ d.value.count + '건']); return tooltip.style("visibility", "visible");}) // 마우스 오버 데이터 값
                    .on("mousemove", function(){return tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");}) // tooltip 위치
                    .on("mouseout", function(){return tooltip.style("visibility", "hidden");});

                        //return data.calendar_data;
                    });


            // 그래프의 사이즈 지정
            var svg = d3.select("svg"), // 위의 svg를 가르킴
                width = +svg.attr("width"), // 위의 svg의 width값을 가져옴
                height = +svg.attr("height"),// 위의 svg의 height값을 가져옴
                margin = {top: 50, right: 30, bottom: 30, left: 40}; //svg의 여백

            // x축 범위 지정
            var x = d3.scaleLinear() 
                .domain([1, monthDate])
                .range([0 , 850]);

            // y축 범위 지정
            var y = d3.scaleLinear() // y축은 숫자형이기 때문에 scaleLinear를 쓴다.
                .domain([0, 45]) 
                .range([450, 0]);

            // d3.axisBottom() / axisLeft()을 이용해 x축,y축 설정
            var xAxis = d3.axisBottom(x) // 축의 범위 / 배치설정
                .ticks(monthDate); // 눈금 갯수 설정

            var yAxis = d3.axisLeft(y)
                .ticks(10);

            // call을 사용해서 x축, y축을 생성
            var gx = svg.append("g")
                .attr("class", "axisX")
                .attr("transform", "translate(55," + (height - margin.bottom) + ")") // x축의 위치 조정  // translate값을 <--이런식으로 적어놓았는데 그냥 평범하게 translate(60,30) 써도 된다.
                .call(xAxis);

            var gy = svg.append("g")
                .attr("class", "axisY")
                .attr("transform", "translate(" + margin.left + ",60)") // y축의 위치 조정
                //.call(d3.axisLeft(y).tickValues([0, 5, 10, 15, 20, 25, 30, 35, 40, 45]).tickSize(-width))
                .call(yAxis)
                // 여기서부터 y축 text
                .append("text")
                .attr("x", -6) // 숫자가 높으면 위로 낮으면 아래로 텍스트가 움직임
                .attr("y", 20) // 숫자가 높으면 오른쪽으로 낮으면 왼쪽으로 텍스트가 움직임
                .attr("transform", "rotate(-90)")
                .attr("fill", "#000") 
                .attr("text-anchor", "end")
                .attr("font-weight", "bold")
                .text("결제 금/월 (단위 : 만원)");

                        //tooltip
            var tooltip = d3.select("body")
                .append("div")
                .style("position", "absolute")
                .style("z-index", "10")
                .style("visibility", "hidden")
                .style("padding", "10px")
                .style("background", "rgba(255,255,255,0.6)")                    
                .style("border", "1px solid #f5f5f5")
                .style("border-radius", "4px")
                .style("text-anchor", "end")
                .style("font-weight", "bold")
                .style("color", "#000")
                .text("a simple tooltip");

        }

        getData();

  }, []); 

  return (
    <div className="chart-container">
      <svg width="922" height="550"></svg>
    </div>
  );
};

export default D3Chart;

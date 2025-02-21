import ReactEcharts from "echarts-for-react";
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import {
  ChartControlsProps,
  ChartControlStateProps,
} from "../../redux/ChartPoperties/ChartControlsInterface";
import { ColorSchemes } from "../ChartOptions/Color/ColorScheme";
import { formatChartLabelValue, formatChartLabelValueForSelectedMeasure } from "../ChartOptions/Format/NumberFormatter";
import { ChartsMapStateToProps, ChartsReduxStateProps } from "./ChartsCommonInterfaces";

import { palette } from "../..";

import {getContrastColor} from '../CommonFunctions/CommonFunctions';


const GaugeChart = ({
  //props
  propKey,
  graphDimension,
  chartArea,
  graphTileSize,
  colorScheme,
  softUI,

  //state
  chartControls,
  chartProperties
}: ChartsReduxStateProps) => {
  var chartControl: ChartControlsProps = chartControls.properties[propKey];
  let chartData: any[] = chartControl.chartData ? chartControl.chartData : [];
  const [gaugeChartData, setGaugeChartData] = useState<any>([]);

  var colorArray: any[] = [];

  const getColors = () => {
    for (
      let i = 0;
      i < chartControl.axisOptions.gaugeChartControls.stepcolor.length;
      i++
    ) {
      colorArray.push([
        chartControl.axisOptions.gaugeChartControls.stepcolor[i].per,
        chartControl.axisOptions.gaugeChartControls.stepcolor[i].color,
      ]);
    }
  };

  getColors();

  useEffect(() => {
    if (chartData.length >= 1) {
      setGaugeChartData([
        {
          name: Object.keys(chartData[0])[0],
          value: Object.values(chartData[0])[0],
        },
      ]);
    }
  }, [chartData]);
  var chartThemes: any[] = ColorSchemes.filter((el) => {
    if(colorScheme)
     return el.name === colorScheme;
    else 
    return el.name === chartControl.colorScheme
  });

  const RenderChart = () => {
    return (
      <ReactEcharts
        // theme={chartControl.colorScheme}
        style={{
          padding: "1rem",
          paddingBottom: "0px",
          width: graphDimension.width,
          height: graphDimension.height + 5,
          overflow: "hidden",
          margin: "auto",
          border: chartArea
            ? "none"
            : graphTileSize
              ? "none"
              : "1px solid rgb(238,238,238)",
        }}
        option={{
          color: chartThemes[0].colors,
          backgroundColor: chartThemes[0].background,
          animation: chartArea ? false : true,
          legend: {
            // textStyle :{color : getContrastColor(chartThemes[0].background)},
            type: "scroll",
            show: chartControl.legendOptions?.showLegend,
            itemHeight:
              chartArea === "dashboard"
                ? chartControl.legendOptions?.symbolHeight / 2
                : chartControl.legendOptions?.symbolHeight,
            itemWidth:
              chartArea === "dashboard"
                ? chartControl.legendOptions?.symbolWidth / 2
                : chartControl.legendOptions?.symbolWidth,
            itemGap: chartControl.legendOptions?.itemGap,

            left: chartControl.legendOptions?.position?.left,
            top: chartControl.legendOptions?.position?.top,
            orient: chartControl.legendOptions?.orientation,
            textStyle:{
              color:chartThemes[0].dark?"#ffffff":palette.primary.contrastText,
            }
          },
          tooltip: { show: chartControl.mouseOver.enable },

          series: [
            {
              type: "gauge",
              radius: chartControl.chartMargin.radius + "%",

              max: gaugeChartData[0]
                ? chartControl.axisOptions.gaugeAxisOptions.isMaxAuto
                  ? gaugeChartData[0].value * 2
                  : chartControl.axisOptions.gaugeAxisOptions.max
                : 0,

              min: chartControl.axisOptions.gaugeAxisOptions.min,

              data: gaugeChartData,

              axisLine: {
                lineStyle: {
                  width: 10,
                  color: [...colorArray],
                  ...(softUI?{
                    shadowBlur: 10,
                    shadowColor: "rgba(0, 0, 0, 0.5)",
                    shadowOffsetX: 3,
                    shadowOffsetY: 3,
                  }:{})
                },

                roundCap: true,
              },
              pointer: {
                itemStyle: {
                  color: "auto",
                },
              },
              startAngle: chartControl.axisOptions.gaugeAxisOptions.startAngle,
              endAngle: chartControl.axisOptions.gaugeAxisOptions.endAngle,
              axisTick: {
                show: chartControl.axisOptions.gaugeAxisOptions.showTick,
                length: chartControl.axisOptions.gaugeAxisOptions.tickSize,
                distance: chartControl.axisOptions.gaugeAxisOptions.tickPadding,
              },
              detail: {
                /* holds the value that display in the center of the gauge*/
                formatter: (value: number) => {
                  if (value === null || value === undefined || isNaN(value)) {
                    return "(Blank)";
                  }
                  var formattedValue = value;
                  formattedValue = formatChartLabelValueForSelectedMeasure(
                    chartControls.properties[propKey],
                    chartProperties.properties[propKey],
                    formattedValue,
                    chartProperties.properties[propKey].chartAxes[chartProperties.properties[propKey].chartAxes.findIndex(
                        (item: any) => item.name === 'Measure')]?.fields[0]?.displayname
                  );
                  return formattedValue;
                },
              },
              axisLabel: {
                show: chartControl.axisOptions.gaugeAxisOptions.showAxisLabel,
                distance:
                  chartControl.axisOptions.gaugeAxisOptions.labelPadding,
                /* holds the value that display when user mouseover on the needle of chart*/
                formatter: (value: number) => {
                  var formattedValue = value;
                  formattedValue = formatChartLabelValueForSelectedMeasure(
                    chartControls.properties[propKey],
                    chartProperties.properties[propKey],
                    formattedValue,
                    chartProperties.properties[propKey].chartAxes[chartProperties.properties[propKey].chartAxes.findIndex(
                      (item: any) => item.name === 'Measure')]?.fields[0]?.displayname
                  );
                  return formattedValue;
                },
              },
            },
          ],
        }}
      />
    );
  };

  return chartData.length >= 1 ? <RenderChart /> : null;
};

const mapStateToProps = (state: ChartsMapStateToProps, ownProps: any) => {
  return {
    chartControls: state.chartControls,
    chartProperties: state.chartProperties
  };
};

export default connect(mapStateToProps, null)(GaugeChart);
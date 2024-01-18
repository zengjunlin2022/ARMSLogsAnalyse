const App = new Vue({
  el: "#app",
  data: {
    // 類型
    type: "待消費緩存",
    types: [
      { text: "待消費緩存", value: "0", wraningThreshold: 3 },
      { text: "設備緩存總數", value: "1", wraningThreshold: 12 },
      { text: "catchError", value: "2", wraningThreshold: null },
    ],
    // 輸入
    content: "",
    // 輸出
    result: "",
    // 高亮staffId
    highlightStaffId: null,
  },
  methods: {
    radioGroupChange() {
      let that = this;
      that.content = "";
      that.result = "";
    },
    checkHasWraning(items) {
      let that = this;
      let btnType = "default";
      console.log(items);
      if (that.type == "待消費緩存") {
        let wraningThreshold = that.types.find(
          (t) => t.text == that.type
        ).wraningThreshold;
        let result = items.filter((item) => {
          return item.data > wraningThreshold;
        });
        if (result.length > 0) {
          btnType = "danger";
        }
      } else if (that.type == "設備緩存總數") {
        let wraningThreshold = that.types.find(
          (t) => t.text == that.type
        ).wraningThreshold;
        let result = items.filter((item) => {
          return item.data > wraningThreshold;
        });
        if (result.length > 0) {
          btnType = "danger";
        }
      } else if (that.type == "catchError") {
        let result = items.filter((item) => {
          return item.data != "-";
        });
        if (result.length > 0) {
          btnType = "danger";
        }
      }
      return btnType;
    },
    setOutputScroll(key) {
      let that = this;
      let $dom = document.getElementById(`output_${key}`);
      $dom.scrollIntoView();
      that.highlightStaffId = key;
    },
    submit() {
      let that = this;
      if (that.content === "") return;
      let list = JSON.parse(that.content).data.items;
      let result = {};
      list.forEach((item) => {
        // 轉碼
        let msg = decodeURIComponent(item.msg);
        // 處理
        if (that.type == "待消費緩存") {
          msg = that.parseWaitPostCount(JSON.parse(msg));
        } else if (that.type == "設備緩存總數") {
          msg = that.parseAllPostCount(JSON.parse(msg));
        } else if (that.type == "catchError") {
          msg = that.parseCatchError(JSON.parse(msg));
        }

        // 按工號聚合
        if (!result.hasOwnProperty(msg.userName)) {
          result[msg.userName] = [];
        }
        result[msg.userName].push(msg);
        // 按時間排序
        result[msg.userName].sort((a, b) => {
          return dayjs(b.time).valueOf() - dayjs(a.time).valueOf();
        });
      });

      // that.result = that.obj2str(result);
      that.result = result;
      // console.log(result);
    },
    getWraningClass(type, data) {
      let that = this;
      let typeIdx = that.types.findIndex((t) => t.text == type);
      let wraningThreshold = that.types[typeIdx].wraningThreshold;
      if (wraningThreshold == null) return "";
      if (data > wraningThreshold) return "wraning";
    },
    obj2str(result) {
      let that = this;
      let str = "";
      for (let staffId in result) {
        str += `<p><strong>${staffId}</strong></p>`;
        result[staffId].forEach((item) => {
          str += `
          <p>
            <span class="item ${that.getWraningClass(that.type, item.data)}">
              ${item.data}
            </span>
            <span class="item ${that.getWraningClass(that.type, item.data)}">
              ${item.time}
            </span>
            <span class="item">${item.device}</span>
          </p>`;
        });
        str += "</br></br>";
      }
      return str;
    },
    parseWaitPostCount(msg) {
      // {"userName":"T2899","funcName":"updateWaitPostCacheCount","apiName":"waitPostCacheCount","data":{"data":0},"time":"2024-01-08 16:44:50","device":"iPhone-iPhone14,2"}
      let userName = msg.userName;
      let data = msg.data.data;
      let time = msg.time;
      let device = msg.device;
      return {
        userName,
        data,
        time,
        device,
        msg,
      };
    },
    parseAllPostCount(msg) {
      // {"userName":"T2606","funcName":"store-actions","apiName":"Schedule_Queue_V2_length","data":6,"time":"2024-01-08 17:57:37","device":"Redmi-Xiaomi 22041211AC"}
      let userName = msg.userName;
      let data = msg.data;
      let time = msg.time;
      let device = msg.device;
      return {
        userName,
        data,
        time,
        device,
        msg,
      };
    },
    parseCatchError(msg) {
      // console.log(msg);
      // {"userName":"T2606","funcName":"store-actions","apiName":"Schedule_Queue_V2_length","data":6,"time":"2024-01-08 17:57:37","device":"Redmi-Xiaomi 22041211AC"}
      let userName = msg.userName;
      let data = !msg.data ? "-" : msg.data;
      let time = msg.time;
      let device = msg.device;
      return {
        userName,
        data,
        time,
        device,
        msg,
      };
    },
  },
  computed: {},
  mounted() {},
});

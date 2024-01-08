const App = new Vue({
  el: "#app",
  data: {
    // 類型
    type: "待消費緩存",
    types: [
      { text: "待消費緩存", value: "0", sort: true },
      { text: "設備全部緩存", value: "1", sort: true },
      { text: "catchError", value: "2", sort: false },
    ],
    // 輸入
    content: "",
    // 輸出
    result: "",
  },
  methods: {
    submit() {
      let that = this;
      if (that.content === "") return;
      let typeIdx = that.types.findIndex((t) => t.text == that.type);
      let list = JSON.parse(that.content).data.items;
      let result = [];
      list.forEach((item) => {
        // 轉碼
        let msg = decodeURIComponent(item.msg);
        // 處理
        if (that.type == "待消費緩存") {
          msg = that.parseWaitPostCount(JSON.parse(msg));
        } else if (that.type == "設備全部緩存") {
          msg = that.parseAllPostCount(JSON.parse(msg));
        } else if (that.type == "catchError") {
          msg = that.parseCatchError(JSON.parse(msg));
        }

        if (that.types[typeIdx].sort) {
          let idx = result.findIndex((r) => r.userName == msg.userName);
          if (idx == -1) {
            result.push(msg);
          } else {
            if (msg.data > result[idx].data) {
              result[idx] = msg;
            }
          }
        } else {
          result.push(msg);
        }
      });

      // 倒序排序
      if (that.types[typeIdx].sort) {
        result.sort((a, b) => {
          return b.data - a.data;
        });
      }
      that.result = result
        .map((item) => {
          return `${item.userName}：${item.data}`;
        })
        .join("\n");
    },
    parseWaitPostCount(msg) {
      // {"userName":"T2899","funcName":"updateWaitPostCacheCount","apiName":"waitPostCacheCount","data":{"data":0},"time":"2024-01-08 16:44:50","device":"iPhone-iPhone14,2"}
      let userName = msg.userName;
      let data = msg.data.data;
      return {
        userName,
        data,
      };
    },
    parseAllPostCount(msg) {
      // {"userName":"T2606","funcName":"store-actions","apiName":"Schedule_Queue_V2_length","data":6,"time":"2024-01-08 17:57:37","device":"Redmi-Xiaomi 22041211AC"}
      let userName = msg.userName;
      let data = msg.data;
      return {
        userName,
        data,
      };
    },
    parseCatchError(msg) {
      console.log(msg);
      // {"userName":"T2606","funcName":"store-actions","apiName":"Schedule_Queue_V2_length","data":6,"time":"2024-01-08 17:57:37","device":"Redmi-Xiaomi 22041211AC"}
      let userName = msg.userName;
      let data = msg.data;
      return {
        userName,
        data,
      };
    },
  },
  computed: {},
  mounted() {},
});

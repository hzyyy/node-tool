const axios = require('axios');
const cheerio = require('cheerio');
const xlsx = require('xlsx');
const fs = require('fs');
const { HttpsProxyAgent } = require("https-proxy-agent");
const translatePromise = import('translate');
const url = 'https://zh.wikipedia.org/wiki/%E5%B9%BF%E5%B7%9E%E8%B6%B3%E7%90%83%E4%BF%B1%E4%B9%90%E9%83%A8#%E4%B8%80%E7%BA%BF%E9%98%9F%E5%90%8D%E5%8D%95';
const headers = { 'User-Agent': 'Mozilla/5.0' };

const proxyConfig = {
  headers,
  proxy: false,
  httpsAgent: new HttpsProxyAgent('http://127.0.0.1:7890')
};

axios.get(url, proxyConfig)
  .then(response => {
    const $ = cheerio.load(response.data);

    let players = [];
    const table = $('#mw-content-text .mw-content-ltr small table:eq(0)');
    let playerPosition = null
    table.find('tr').each((index, tr) => {
      let player = {};
      if(index == 0) {
        return true
      }
      
      let isPositionTr = $(tr).children('th').length > 0

      if(isPositionTr) {
        playerPosition = $(tr).children('th').text().trim()
      } else {
        let nameAll = $(tr).children('td:eq(2)').text().trim()?.split(" (");
        let nameCh = nameAll[0]
        let nameEn = nameAll[1].replace(")", "")
        player = {
          ...player,
          "位置": playerPosition,
          "号码": $(tr).children('td:eq(0)').text().trim(),
          "国籍": $(tr).children('td:eq(1)').find('img').attr('alt').trim(),
          "姓名": nameCh,
          "英文名": nameEn,
          "出生日期": $(tr).children('td:eq(3)').text().trim(),
          "年龄": $(tr).children('td:eq(4)').text().trim(),
          "身高": $(tr).children('td:eq(5)').text().trim(),
          "体重": $(tr).children('td:eq(6)').text().trim(),
          "加盟年份": $(tr).children('td:eq(7)').text().trim(),
          "前属球队": $(tr).children('td:eq(8)').text().trim(),
          "身价": $(tr).children('td:eq(9)').text().trim(),
          "出生地": $(tr).children('td:eq(10)').text().trim(),
        }
      }

      players.push(player);
    });

    console.log(players);

    const worksheet = xlsx.utils.json_to_sheet(players);
    const workbook = xlsx.utils.book_new();
    
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Players');
    xlsx.writeFile(workbook, 'C:/Users/ZhangYuG/Downloads/Players.xlsx');
  })
  .catch(error => {
    console.error(`Error fetching the webpage: ${error.message}`);
  });